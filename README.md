# GEMMA-6: SME Business Advisory Tool

GEMMA-6 runs a single Gemma 3 4B model sequentially through six specialized SME advisor roles—Pricing, Revenue Forecasting, Supplier, Collections, Operations, and Growth—each analyzing a business decision from its domain perspective. A Front Desk synthesizer combines their insights. All numerical reasoning is grounded in deterministic Python calculator tools (no hallucinated numbers), and advisor reports are persisted to disk to serve as shared memory across the stateless advisors.

## Prerequisites

- **Ollama** installed and running
- **Gemma 3 4B** model pulled: `ollama pull gemma3:4b`
- **Python 3.11+**
- **Node 18+**

## Setup & Run

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend exposes REST endpoints for triggering analysis runs, polling status, retrieving reports, and chatting with individual advisors.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on port 5173 and proxies `/api` requests to the backend at `localhost:8000`. It provides an interactive dashboard to select example scenarios, monitor advisor progress, view markdown reports, and chat with advisors.

## Project Structure

**Backend** (`backend/`):
- `main.py` — FastAPI routes matching CONTRACT.md
- `gemma_runner.py` — Ollama client and model locking
- `orchestrator.py` — Orchestrates the six-advisor pipeline
- `advisors.py` — Advisor definitions and system prompts
- `tools.py` — Deterministic calculators (pricing, revenue, supplier, collections, operations, growth)
- `advisor_chat.py`, `front_desk.py` — Advisor and synthesizer Q&A
- `store.py` — Disk-backed report and session storage
- `data/examples.json` — Three preset business scenarios for demo

**Frontend** (`frontend/`):
- Vite + React + Tailwind dashboard with advisor cards, report viewer, and chat panels

## How It Works

1. **Input**: User provides business context (revenue, customers, suppliers, collections DSO, operations capacity/stock) and a decision to analyze.
2. **Sequential Advisor Run**: The orchestrator loops through six advisors in order. Each advisor:
   - Loads its domain-specific tools (price elasticity, supplier concentration, cash flow impact, etc.)
   - Receives the business context and decision
   - Reasons over tool calls to ground numeric claims
   - Writes a markdown report to disk
3. **Synthesis**: The Front Desk advisor reads all six reports and produces an integrated overview.
4. **Persistence**: Reports live in `backend/reports/` (one `.md` file per advisor). Sessions cache chat transcripts.
5. **Tool Grounding**: Every numeric insight comes from a deterministic tool call (no LLM generation of numbers). Reports cite formulas and inputs.

## Demo

Load one of three preset scenarios from the dashboard:
- **Bakery**: Neighborhood bakery considering a 10% price increase on sourdough loaves.
- **Retail**: Small apparel store weighing a seasonal clearance discount.
- **Manufacturer**: Parts maker facing supplier concentration and a large new contract opportunity.

Preset business contexts and decisions are in `backend/data/examples.json` and can be selected from the frontend's example picker for a quick demo.
