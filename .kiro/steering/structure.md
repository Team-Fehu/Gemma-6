# Project Structure

```
├── CONTRACT.md              # API contract between frontend and backend
├── backend/
│   ├── main.py              # FastAPI routes (matches CONTRACT.md)
│   ├── gemma_runner.py      # Ollama client, model lock, tool-call loop
│   ├── orchestrator.py      # Sequential six-advisor pipeline + synthesis
│   ├── advisors.py          # Advisor definitions, system prompts, report schema
│   ├── tools.py             # Deterministic calculator functions (no I/O)
│   ├── advisor_chat.py      # Per-advisor follow-up Q&A
│   ├── front_desk.py        # Synthesis and general Q&A
│   ├── store.py             # Disk-backed report/session/example storage
│   ├── data/
│   │   ├── examples.json    # Preset demo scenarios
│   │   ├── business_context.json  # Last-run input (runtime)
│   │   └── decision.txt     # Last-run decision (runtime)
│   ├── reports/             # Generated advisor reports (.md) + tool logs (.tools.jsonl)
│   ├── sessions/            # Chat transcript JSON files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Root component, view routing
│   │   ├── components/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── ChatView.tsx
│   │   │   ├── AdvisorCard.tsx
│   │   │   ├── NotesPanel.tsx
│   │   │   └── PresetPicker.tsx
│   │   └── lib/
│   │       └── api.ts       # Typed fetch wrappers for all endpoints
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
```

## Architecture Notes

- Backend is a flat module layout (no nested packages). All imports are direct module references.
- `CONTRACT.md` is the source of truth for API shape—routes in `main.py` must match it exactly.
- Tools in `tools.py` are pure functions—no I/O, no model calls. Every result carries `value`, `formula`, and `inputs` for traceability.
- Reports on disk (`backend/reports/`) are the shared memory between advisors. No in-memory state persists across advisor runs.
- Frontend uses simple `useState` view routing (landing → dashboard → chat). No router library.
- Advisor IDs are: `pricing`, `revenue`, `supplier`, `collections`, `operations`, `growth`. The synthesizer is `overview`/`front_desk`.
