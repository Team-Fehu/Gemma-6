# GEMMA-6 API Contract

Backend: FastAPI, default port `8000`. Frontend: Vite dev server, default port `5173`, proxies `/api` to backend.

Simplified for hackathon build: **polling**, not SSE/WebSocket. One `GET /api/status` call every ~1.5s during a run is enough for a 3-5 minute demo and has zero connection-management risk on stage.

---

## POST /api/analyze

Start the six-advisor run + synthesis. Fire-and-forget; poll `/api/status` for progress.

**Request**
```json
{
  "business_context": { "...": "see business_context schema in backend/README" },
  "decision": "Raise prices on our top-selling bread loaf by 10%"
}
```

**Response `202`**
```json
{ "run_id": "run_1234", "status": "started" }
```

**Response `409`** (a run is already in progress)
```json
{ "status": "busy", "message": "Advisors are already thinking. Try again shortly." }
```

---

## GET /api/status

Poll this while a run is active.

**Response**
```json
{
  "state": "idle | running | done | error",
  "run_id": "run_1234",
  "current_advisor": "pricing | revenue | supplier | collections | operations | growth | front_desk | null",
  "completed": ["pricing", "revenue"],
  "order": ["pricing", "revenue", "supplier", "collections", "operations", "growth", "front_desk"],
  "error": null
}
```

Frontend uses `completed` to light up cards, `current_advisor` to show the "thinking" spinner on the active card.

---

## GET /api/reports

All reports, for the notes panel and the dashboard summary.

**Response**
```json
{
  "pricing": "# Pricing Advisor Report\n\n## Verdict\n...",
  "revenue": "# Revenue Forecasting Advisor Report\n...",
  "supplier": "...",
  "collections": "...",
  "operations": "...",
  "growth": "...",
  "overview": "# Front Desk Overview\n..."
}
```
Missing reports (not yet generated) are omitted from the object, not sent as `null`.

---

## GET /api/reports/{id}

One report. `{id}` is one of `pricing | revenue | supplier | collections | operations | growth | overview`.

**Response**
```json
{ "advisor": "pricing", "markdown": "# Pricing Advisor Report\n..." }
```

**Response `404`** if that report doesn't exist yet.

---

## POST /api/advisor/{id}/chat

Talk to one advisor. `{id}` is one of the six advisor ids (not `overview` — general questions go to `/api/frontdesk/chat`).

**Request**
```json
{ "message": "Why did you flag the loyal segment as at-risk?", "session_id": "sess_abc123" }
```
`session_id` is client-generated (e.g. `crypto.randomUUID()`), stable for one chat panel's lifetime.

**Response**
```json
{ "answer": "Because..." }
```

**Response `503`** (model lock held by an analysis run)
```json
{ "status": "busy", "message": "Advisors are still thinking. Try again in a moment." }
```

**Response `404`** if that advisor has no report yet (chat needs the report as grounding — run `/api/analyze` first).

---

## POST /api/frontdesk/chat

Same shape as advisor chat, but answered by the front desk against all six reports.

**Request**
```json
{ "message": "Should I go ahead with the price increase?", "session_id": "sess_abc123" }
```

**Response**
```json
{ "answer": "..." }
```

Same `503` busy behavior as advisor chat.

---

## GET /api/examples

Preset business scenarios for the showcase/demo picker (loads straight into the analyze form).

**Response**
```json
{
  "examples": [
    { "id": "bakery", "name": "Neighborhood Bakery", "description": "...", "business_context": {...}, "decision": "..." },
    { "id": "retail", "name": "Retail Apparel Store", "description": "...", "business_context": {...}, "decision": "..." },
    { "id": "manufacturer", "name": "Small Manufacturer", "description": "...", "business_context": {...}, "decision": "..." }
  ]
}
```

---

## Error shape (all endpoints)

```json
{ "status": "error", "message": "human readable" }
```

## Notes for the frontend build

- Advisor display names/icons (map id -> label):
  - `pricing` — Pricing Advisor
  - `revenue` — Revenue Forecasting Advisor
  - `supplier` — Supplier Advisor
  - `collections` — Collections Advisor
  - `operations` — Operations Advisor
  - `growth` — Growth Advisor
  - `overview` / front desk — Front Desk (synthesizer + general Q&A)
- Card states: `idle` (nothing run yet) -> `running` (== `current_advisor`) -> `done` (in `completed`).
- Reports are markdown — render with any lightweight markdown renderer (e.g. `react-markdown`).
