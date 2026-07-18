# Tech Stack

## Backend
- Python 3.11+
- FastAPI 0.115 + Uvicorn
- httpx for async HTTP to Ollama
- Pydantic for request validation
- Ollama as LLM backend (Gemma 3 4B model)

## Frontend
- React 19 + TypeScript 6
- Vite 8 (dev server + bundler)
- Tailwind CSS 3.4
- react-markdown for rendering advisor reports
- oxlint for linting

## Infrastructure
- Ollama must be running locally with `gemma3:4b` pulled
- Vite proxies `/api` to backend at `localhost:8000`
- No database—disk-backed JSON/markdown storage

## Commands

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # dev server on :5173
npm run build    # tsc + vite build
npm run lint     # oxlint
```

## Environment Variables
- `OLLAMA_HOST` — Ollama endpoint (default: `http://localhost:11434`)
- `GEMMA_MODEL` — Model name (default: `gemma3:4b`)
