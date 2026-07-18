# Product

GEMMA-6 is a local-first business advisory prototype. It turns a single business decision into six focused specialist analyses, then synthesizes them into one integrated recommendation.

## Core idea

Use one efficient local model (Gemma 3 4B via Ollama) as a team of narrow specialists, and move all numerical truth out of the model into deterministic Python calculators.

## The advisory team

Six specialist advisors run sequentially, each with access only to the calculators for its domain:

- `pricing` — price effect on demand, margin, churn
- `revenue` — projections vs. status quo over time
- `supplier` — concentration, dependency, contract cost exposure
- `collections` — payment timing and late-payment exposure
- `operations` — capacity and inventory feasibility
- `growth` — positioning and cannibalization

A seventh role, the **Front Desk** (`overview`), reads all six reports, identifies agreement and conflict, and writes the integrated verdict. It never re-derives numbers.

## Guiding principles

- Specialists, not one generic answer.
- Tools compute; the model reasons.
- Reports are memory: stateless advisors hand off through persisted Markdown reports.
- Local by default: model, reports, and sessions stay on local disk.
- Never invent missing business figures — surface them as open questions.

## Scope

This is a local prototype, not production financial advice or a multi-tenant service. Run state lives in process memory, persistence uses local files, and there is no auth or user isolation.
