# Product: GEMMA-6

GEMMA-6 is an SME (small/medium enterprise) business advisory tool. It runs a single Gemma 3 4B model sequentially through six specialized advisor roles—Pricing, Revenue Forecasting, Supplier, Collections, Operations, and Growth—each analyzing a business decision from its domain perspective.

A "Front Desk" synthesizer reads all six advisor reports and produces an integrated overview with a verdict.

Key design principles:
- All numeric reasoning is grounded in deterministic Python calculator tools (no LLM-generated numbers)
- Advisor reports are persisted to disk as shared memory across stateless advisor runs
- The system uses polling (not SSE/WebSocket) for progress updates
- One model, one lock—only one generation can run at a time
- Built as a hackathon demo with three preset business scenarios (bakery, retail, manufacturer)
