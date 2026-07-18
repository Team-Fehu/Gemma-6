<div align="center">

# GEMMA-6

### One local model. Six business advisors. Numbers you can trace.

GEMMA-6 turns a business decision into six focused analyses, then combines them into one practical recommendation. Gemma handles the reasoning; deterministic Python tools handle every derived number.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Gemma_3_4B-black)
![License](https://img.shields.io/badge/status-prototype-8B5CF6)

[Why GEMMA-6?](#why-gemma-6) · [How it works](#how-it-works) · [Quick start](#quick-start) · [API](#api-reference) · [Architecture](#architecture)

</div>

---

## Why GEMMA-6?

Small-business owners routinely make decisions that cross several domains at once. A price increase affects demand, revenue, cash collection, inventory, suppliers, and long-term positioning. A generic chatbot may answer confidently, but it rarely separates those concerns or makes its arithmetic auditable.

GEMMA-6 is our experiment in a more useful pattern:

> Use one efficient local model as a team of narrow specialists, and move numerical truth out of the model into deterministic software.

Our goal is not to replace professional judgment. It is to give an owner a structured first pass: what each domain sees, which assumptions matter, where advisors disagree, and what to investigate next.

| Principle | What it means |
| --- | --- |
| **Specialists, not one generic answer** | Six isolated roles inspect the same decision from different business perspectives. |
| **Tools compute; the model reasons** | Derived figures come from Python calculators that return values, formulas, and inputs. |
| **Reports are memory** | Stateless advisors communicate through persisted Markdown reports, not hidden agent state. |
| **Local by default** | Gemma runs through Ollama and reports/sessions remain on local disk. |

## What the product does

1. The owner selects a preset or supplies structured business context and a decision.
2. The backend runs six advisors **sequentially** through the same Gemma 3 4B model.
3. Each advisor can access only the calculators relevant to its domain.
4. Each advisor produces a consistent Markdown report with a verdict, findings, grounded numbers, risks, recommendation, and open questions.
5. The Front Desk reads the six reports, identifies agreement and conflict, and writes an integrated overview.
6. The owner can open any completed report and ask follow-up questions grounded in that advisor's role, report, and allowed tools.

The frontend exposes this as a visual seven-stage pipeline with presets, live polling, report viewing, and advisor chat.

## The advisory team

| Advisor | Questions it investigates | Deterministic tools |
| --- | --- | --- |
| 💲 **Pricing** | How will price affect demand, margin, and customer churn? | Price elasticity, margin at price, segment churn |
| 📈 **Revenue** | How does the decision compare with the status quo over time? | Revenue projection, uncertainty range |
| 🏭 **Supplier** | Are we concentrated, dependent, or exposed to contract cost changes? | Supplier exposure, renegotiation cost |
| 💰 **Collections** | How could payment timing and late-payment exposure change? | DSO/cash-flow impact, late-payment risk |
| ⚙️ **Operations** | Can capacity and inventory support the expected demand? | Capacity utilization, inventory requirements |
| 🚀 **Growth** | Does this strengthen positioning or cannibalize existing revenue? | Cannibalization estimate |
| 🎯 **Front Desk** | What do all six reports mean together? Where do they disagree? | Synthesis only; it never re-derives numbers |

## How it works

```text
Business context + decision
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│  Pricing → Revenue → Supplier → Collections → Ops → Growth  │
│       one Gemma model · one role at a time · one lock        │
└──────────────────────────────────────────────────────────────┘
            │              │
            │              └── deterministic tool results
            │                    { value, formula, inputs }
            ▼
     Six Markdown reports + JSONL tool logs
            │
            ▼
   Front Desk synthesis → integrated verdict
            │
            ▼
 Report viewer + grounded advisor/front-desk chat
```

### Why sequential execution?

The project targets machines that can comfortably host one small local model, not six model instances. A single asynchronous lock prevents concurrent Ollama generations from competing for memory or compute. During analysis, chat requests return a clear busy response instead of overloading the model.

### Why disk-backed reports?

No advisor remains alive. Its report becomes the durable handoff to the Front Desk and the grounding context for later chat. This makes the prototype inspectable: the owner can read the exact report and developers can inspect every tool call.

### How numeric grounding works

The model requests tools through a constrained `tool_call` block. The runner validates that the tool is registered and allowed for that advisor, executes the Python function, and returns a `tool_result`. Every calculator includes its formula and inputs in the result. If required data is absent, advisor prompts require an open question rather than a guessed value.

## Architecture

### Backend

The FastAPI backend owns orchestration and local persistence:

- `main.py` implements the REST contract and starts analysis as a background task.
- `orchestrator.py` manages run state and the fixed seven-stage sequence.
- `gemma_runner.py` is the only Ollama gateway; it owns model locking and the tool-call loop.
- `advisors.py` defines specialist roles, allowed tools, and the common report schema.
- `tools.py` contains pure calculator functions. Keep model and file I/O out of this module.
- `front_desk.py` synthesizes reports and answers cross-domain questions without recalculating figures.
- `advisor_chat.py` reconstructs a specialist from its prompt, report, context, and capped transcript.
- `store.py` persists inputs, reports, tool logs, examples, and chat sessions.

### Frontend

The React frontend is a focused three-view application:

- **Landing:** explains the local, grounded advisory model.
- **Workspace:** selects presets, edits context JSON, starts a run, and polls progress every 1.5 seconds.
- **Advisor chat:** displays the Markdown report beside a report-grounded conversation.

Navigation is intentionally state-based rather than router-based. Typed fetch wrappers in `frontend/src/lib/api.ts` mirror the API contract in [`CONTRACT.md`](CONTRACT.md).

### Persistence layout

```text
backend/
├── data/
│   ├── examples.json             # Demo scenarios committed to the project
│   ├── business_context.json     # Last run input, generated
│   └── decision.txt              # Last run decision, generated
├── reports/
│   ├── <advisor>.md              # Generated reports
│   └── <advisor>.tools.jsonl     # Auditable tool calls and results
└── sessions/
    └── <session_id>.json         # Chat history, capped at 20 messages
```

## Quick start

### Prerequisites

- [Ollama](https://ollama.com/) installed and running
- Python **3.11+**
- Node.js **18+** and npm

Pull the model once:

```bash
ollama pull gemma3:4b
```

### 1. Start the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Confirm it is available:

```bash
curl http://localhost:8000/api/health
```

Expected shape:

```json
{"status":"ok","model_locked":false}
```

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:8000`.

### 3. Run the demo

1. Choose **Neighborhood Bakery**, **Retail Apparel Store**, or **Small Manufacturer**.
2. Review or edit the decision and business-context JSON.
3. Select **Run six-advisor analysis**.
4. Watch the seven-stage pipeline. Local generation can take several minutes.
5. Open a completed advisor to inspect its report and ask follow-up questions.
6. Open **Front Desk** for the combined verdict and cross-domain discussion.

> Only one model generation runs at a time. Advisor chat is intentionally unavailable while an analysis is using the model.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server used by the backend |
| `GEMMA_MODEL` | `gemma3:4b` | Ollama model used for every role |

Example:

```bash
OLLAMA_HOST=http://localhost:11434 GEMMA_MODEL=gemma3:4b \
  uvicorn main:app --reload --port 8000
```

## API reference

The complete request/response contract lives in [`CONTRACT.md`](CONTRACT.md).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/analyze` | Start the advisor pipeline; returns `202`, or `409` if already running |
| `GET` | `/api/status` | Poll run state, current advisor, completed stages, and errors |
| `GET` | `/api/reports` | Retrieve every report currently on disk |
| `GET` | `/api/reports/{id}` | Retrieve one advisor report or the `overview` |
| `POST` | `/api/advisor/{id}/chat` | Ask a specialist a report-grounded follow-up question |
| `POST` | `/api/frontdesk/chat` | Ask a question grounded across all six reports |
| `GET` | `/api/examples` | Load the three bundled scenarios |
| `GET` | `/api/health` | Check backend health and model-lock status |

Start an analysis directly:

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{
    "business_context": {
      "business": {"monthly_revenue": 20000},
      "product": {"current_price": 5, "unit_cost": 2, "monthly_volume": 3000}
    },
    "decision": "Should we raise the product price by 10%?"
  }'
```

Then poll:

```bash
curl http://localhost:8000/api/status
```

## Project structure

```text
.
├── CONTRACT.md                 # Source of truth for the REST interface
├── backend/
│   ├── main.py                 # FastAPI routes
│   ├── orchestrator.py         # Sequential advisor pipeline and run state
│   ├── gemma_runner.py         # Ollama gateway, lock, and tool loop
│   ├── advisors.py             # Roles, prompts, report schema, tool permissions
│   ├── tools.py                # Pure deterministic calculators
│   ├── advisor_chat.py         # Specialist follow-up chat
│   ├── front_desk.py           # Cross-report synthesis and chat
│   ├── store.py                # Local disk persistence
│   ├── data/examples.json      # Bakery, retail, and manufacturer demos
│   ├── reports/                # Generated Markdown and JSONL audit logs
│   └── sessions/               # Generated chat transcripts
└── frontend/
    ├── src/App.tsx             # Landing/workspace/chat view state
    ├── src/components/         # Dashboard, cards, presets, chat, report panel
    ├── src/lib/api.ts          # Typed API client
    └── vite.config.ts          # React plugin and backend proxy
```

## Development commands

### Frontend

```bash
cd frontend
npm run dev       # Vite development server
npm run lint      # Oxlint
npm run build     # TypeScript project build + production bundle
npm run preview   # Preview the production bundle
```

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

There is currently no automated test suite. For backend changes, check `/api/health`, run a preset analysis, inspect generated reports/tool logs, and exercise one specialist and Front Desk chat. For frontend changes, run lint and the production build.

## Design rules for contributors

- Keep [`CONTRACT.md`](CONTRACT.md) and `backend/main.py` aligned when API behavior changes.
- Keep calculators deterministic and side-effect-free. Return `value`, `formula`, and `inputs` for traceability.
- Never ask the model to invent missing business figures; surface them as open questions.
- Preserve the fixed advisor IDs: `pricing`, `revenue`, `supplier`, `collections`, `operations`, `growth`.
- Preserve sequential model access unless the runtime architecture is deliberately redesigned.
- Treat generated files under `backend/reports/`, `backend/sessions/`, and last-run inputs as runtime artifacts.

## Current scope and limitations

GEMMA-6 is a local prototype, not production financial advice or a multi-tenant service.

- Run state is held in process memory, so restarting the backend resets live progress.
- Reports and sessions use local files rather than a database.
- The backend currently allows all CORS origins for local development.
- Sessions are client-generated and have no authentication or user isolation.
- A single global context and report set represent the latest analysis.
- Tool quality depends on receiving the expected structured inputs.
- The Front Desk synthesizes available reports; it does not independently verify or recalculate them.

These constraints keep the core idea easy to inspect: one model, explicit roles, deterministic calculations, durable reports, and a transparent final recommendation.

## Product direction

The next step is to evolve this prototype without losing its auditability: validate business-context schemas, isolate runs and users, add report provenance in the UI, test calculators and orchestration, and support durable run history. The north star remains simple:

> Make AI business analysis easier to question, inspect, and trust.

---

<div align="center">

**GEMMA-6** · Six focused perspectives · One local model · Zero invented numbers

</div>
