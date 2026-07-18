# Tech Stack

## Backend

- Python 3.11+
- FastAPI 0.115 with Uvicorn
- Pydantic 2.x for request/response models
- httpx for talking to Ollama
- Ollama running Gemma 3 4B (`gemma3:4b`) as the only model

No database. Persistence is local files (Markdown reports, JSONL tool logs, JSON sessions).

## Frontend

- React 19 + TypeScript 6
- Vite 8 (dev server on port 5173, proxies `/api` to backend on 8000)
- Tailwind CSS 3 + PostCSS + Autoprefixer
- react-markdown for rendering reports
- Oxlint for linting

Navigation is state-based (view switching in `App.tsx`), not router-based.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server used by the backend |
| `GEMMA_MODEL` | `gemma3:4b` | Ollama model used for every role |

## Common commands

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # run API
curl http://localhost:8000/api/health    # health check
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Vite dev server
npm run lint      # Oxlint
npm run build     # tsc -b + production bundle
npm run preview   # preview production bundle
```

### Model

```bash
ollama pull gemma3:4b   # one-time
```

## Testing

There is no automated test suite. Verify changes manually:

- Backend: check `/api/health`, run a preset analysis, inspect generated reports and tool logs, exercise one advisor and Front Desk chat.
- Frontend: run `npm run lint` and `npm run build`.

## Conventions

- Keep `CONTRACT.md` and `backend/main.py` aligned when API behavior changes.
- Keep calculators in `tools.py` pure and side-effect-free; every result returns `value`, `formula`, and `inputs` for traceability.
- Keep model calls and file I/O out of `tools.py`.
- Preserve the fixed advisor IDs: `pricing`, `revenue`, `supplier`, `collections`, `operations`, `growth`.
- Preserve sequential model access — one generation at a time behind a single lock.
- Never use long-running/watch commands in automation; use `--run`-style single executions.
- Do not use bare markdown headers in chat responses per project style, but steering/docs files use standard markdown.
