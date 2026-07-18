"""FastAPI routes. Matches CONTRACT.md exactly."""
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import advisor_chat
import advisors
import front_desk
import orchestrator
import store
from gemma_runner import BusyError, gemma_runner

app = FastAPI(title="GEMMA-6 backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    business_context: dict
    decision: str


class ChatRequest(BaseModel):
    message: str
    session_id: str


@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    if orchestrator.run_state.state == "running":
        return JSONResponse(status_code=409, content={"status": "busy", "message": "Advisors are already thinking. Try again shortly."})

    run_id = f"run_{uuid.uuid4().hex[:8]}"
    # Fire-and-forget background task; frontend polls /api/status.
    import asyncio
    asyncio.create_task(orchestrator.run_analysis(run_id, req.business_context, req.decision))
    return JSONResponse(status_code=202, content={"run_id": run_id, "status": "started"})


@app.get("/api/status")
async def status():
    return orchestrator.run_state.to_dict()


@app.post("/api/reset")
async def reset():
    if orchestrator.run_state.state == "running":
        return JSONResponse(status_code=409, content={"status": "busy", "message": "Advisors are still thinking. Wait for the run to finish before resetting."})
    orchestrator.run_state.reset()
    store.clear_all()
    return {"status": "ok"}


@app.get("/api/reports")
async def reports():
    return store.read_all_reports()


@app.get("/api/reports/{advisor_id}")
async def report(advisor_id: str):
    markdown = store.read_report(advisor_id)
    if markdown is None:
        return JSONResponse(status_code=404, content={"status": "error", "message": f"no report for '{advisor_id}' yet"})
    return {"advisor": advisor_id, "markdown": markdown}


@app.post("/api/advisor/{advisor_id}/chat")
async def advisor_chat_route(advisor_id: str, req: ChatRequest):
    if advisor_id not in advisors.ADVISOR_ORDER:
        return JSONResponse(status_code=404, content={"status": "error", "message": f"unknown advisor '{advisor_id}'"})
    try:
        answer = await advisor_chat.chat(advisor_id, req.session_id, req.message)
        return {"answer": answer}
    except FileNotFoundError as exc:
        return JSONResponse(status_code=404, content={"status": "error", "message": str(exc)})
    except BusyError as exc:
        return JSONResponse(status_code=503, content={"status": "busy", "message": exc.message})


@app.post("/api/frontdesk/chat")
async def frontdesk_chat_route(req: ChatRequest):
    reports_dict = store.read_all_reports()
    if not reports_dict:
        return JSONResponse(status_code=404, content={"status": "error", "message": "no reports yet — run /api/analyze first"})
    try:
        transcript = store.load_session(req.session_id)
        answer = await front_desk.answer(reports_dict, transcript, req.message)
        transcript.append({"role": "user", "content": req.message})
        transcript.append({"role": "assistant", "content": answer})
        store.save_session(req.session_id, transcript)
        return {"answer": answer}
    except BusyError as exc:
        return JSONResponse(status_code=503, content={"status": "busy", "message": exc.message})


@app.get("/api/examples")
async def examples():
    return store.load_examples()


@app.get("/api/health")
async def health():
    return {"status": "ok", "model_locked": gemma_runner.is_locked()}
