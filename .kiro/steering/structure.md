# Project Structure

Two top-level applications: `backend/` (FastAPI) and `frontend/` (React + Vite). `CONTRACT.md` at the root is the source of truth for the REST interface.

## Backend

```text
backend/
├── main.py            # FastAPI routes; implements CONTRACT.md
├── orchestrator.py    # Sequential advisor pipeline + in-memory run state
├── gemma_runner.py    # Only Ollama gateway; owns model lock and tool-call loop
├── advisors.py        # Roles, prompts, report schema, per-advisor tool permissions
├── tools.py           # Pure deterministic calculators (no I/O, no model calls)
├── advisor_chat.py    # Report-grounded specialist follow-up chat
├── front_desk.py      # Cross-report synthesis and chat (never recalculates)
├── store.py           # Local disk persistence
├── data/
│   ├── examples.json          # Committed demo scenarios (bakery, retail, manufacturer)
│   ├── business_context.json  # Generated: last run input
│   ├── decision.txt           # Generated: last run decision
│   └── sample_documents/      # Sample CSV source data
├── reports/           # Generated: <advisor>.md and <advisor>.tools.jsonl audit logs
└── sessions/          # Generated: <session_id>.json chat transcripts (capped at 20 messages)
```

### Module responsibilities

- Numeric truth lives only in `tools.py`. If a number is derived, it comes from a calculator that returns `value`, `formula`, and `inputs`.
- `gemma_runner.py` is the single point of contact with Ollama. All model locking and tool dispatch flows through it.
- `orchestrator.py` owns the fixed seven-stage sequence and run state (held in process memory).
- `store.py` owns all file reads/writes. Keep persistence logic out of other modules.

### Runtime artifacts

Treat files under `backend/reports/`, `backend/sessions/`, and the generated `data/business_context.json` / `data/decision.txt` as runtime output, not source.

## Frontend

```text
frontend/
├── index.html
├── vite.config.ts        # React plugin + /api proxy to backend
├── tailwind.config.js
└── src/
    ├── App.tsx           # Landing / workspace / chat view state
    ├── main.tsx          # Entry point
    ├── index.css, App.css
    ├── components/       # DashboardView, AdvisorCard, PresetPicker, ChatView, NotesPanel, LandingPage
    ├── lib/
    │   ├── api.ts        # Typed fetch client mirroring CONTRACT.md
    │   └── mockData.ts   # Mock responses for local UI development
    └── assets/           # Images and icons
```

### Frontend conventions

- Typed API wrappers in `lib/api.ts` mirror the endpoints and shapes in `CONTRACT.md`. Update both together.
- Views switch via state in `App.tsx`, not a router.
- Reports are Markdown, rendered with react-markdown.
- Advisor card states flow `idle` -> `running` (matches `current_advisor`) -> `done` (in `completed`).
- The workspace polls `GET /api/status` roughly every 1.5s during a run.

## API surface

Endpoints are defined in `CONTRACT.md` and implemented in `backend/main.py`. Advisor IDs are fixed: `pricing`, `revenue`, `supplier`, `collections`, `operations`, `growth`, plus `overview` for the Front Desk.
