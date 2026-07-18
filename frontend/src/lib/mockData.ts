import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ChatResponse,
  Example,
  ReportResponse,
  ReportsResponse,
  StatusResponse,
} from './api';

export const MOCK_ORDER = [
  'pricing',
  'revenue',
  'supplier',
  'collections',
  'operations',
  'growth',
  'front_desk',
];

export const MOCK_EXAMPLES: Example[] = [
  {
    id: 'bakery',
    name: 'Neighborhood Bakery',
    description: 'Evaluate a 10% price increase on a signature sourdough loaf.',
    business_context: {
      business: { name: 'Sweet Rise Bakery', sector: 'Food & Beverage', monthly_revenue: 85000 },
      product: { current_price: 5, unit_cost: 1.5, monthly_volume: 2500 },
      operations: { current_capacity: 2800, current_stock: 850, lead_time_days: 2 },
    },
    decision: 'Raise the price of our signature sourdough loaf by 10%.',
  },
  {
    id: 'retail',
    name: 'Retail Apparel Store',
    description: 'Review a seasonal clearance discount for end-of-season inventory.',
    business_context: {
      business: { name: 'Urban Threads', sector: 'Retail Apparel', monthly_revenue: 120000 },
      product: { current_price: 75, unit_cost: 25, monthly_volume: 800 },
      operations: { current_capacity: 900, current_stock: 320, lead_time_days: 4 },
    },
    decision: 'Run a 25% seasonal clearance discount on end-of-season inventory.',
  },
  {
    id: 'manufacturer',
    name: 'Small Manufacturer',
    description: 'Assess a large wholesale contract and supplier concentration risk.',
    business_context: {
      business: { name: 'Precision Parts Inc', sector: 'Manufacturing', monthly_revenue: 200000 },
      suppliers: [
        { name: 'Asian Steel Corp', share_of_spend: 0.7 },
        { name: 'Domestic Metals Inc', share_of_spend: 0.3 },
      ],
      operations: { current_capacity: 5500, current_stock: 1200, lead_time_days: 6 },
    },
    decision: 'Accept a large new 18-month wholesale contract worth 40% of current annual revenue.',
  },
];

const ADVISOR_LABELS: Record<string, string> = {
  pricing: 'Pricing Advisor',
  revenue: 'Revenue Forecasting Advisor',
  supplier: 'Supplier Advisor',
  collections: 'Collections Advisor',
  operations: 'Operations Advisor',
  growth: 'Growth Advisor',
  overview: 'Front Desk',
};

const ADVISOR_FINDINGS: Record<string, string[]> = {
  pricing: ['Review customer sensitivity before changing price.', 'Protect contribution margin while testing demand response.'],
  revenue: ['Compare the decision with the status quo over six months.', 'Use a range until growth assumptions are validated.'],
  supplier: ['Check concentration before increasing dependency.', 'Confirm contract terms and alternate-source lead times.'],
  collections: ['Monitor payment timing and late-payment exposure.', 'Protect working capital as volume changes.'],
  operations: ['Validate capacity, stock, lead time, and staffing.', 'Stage the decision if projected demand exceeds capacity.'],
  growth: ['Test strategic fit and competitor response.', 'Separate genuinely new revenue from cannibalization.'],
};

let mockStatus: StatusResponse = {
  state: 'idle',
  run_id: '',
  current_advisor: null,
  completed: [],
  order: MOCK_ORDER,
  error: null,
};
let runStartedAt = 0;
let lastRequest: AnalyzeRequest | null = null;

function buildReport(id: string): string {
  if (id === 'overview') {
    return `# Front Desk Overview

> **Demo fallback report:** the backend was unavailable, so this is illustrative mock content rather than a live Gemma analysis.

## Overall verdict
**Caution** — validate demand, cash-flow, and capacity assumptions before committing.

## What each advisor found
- **Pricing:** Test customer sensitivity and margin impact.
- **Revenue:** Compare the decision with a six-month status quo.
- **Supplier:** Reduce concentration and confirm contract flexibility.
- **Collections:** Protect cash timing as sales or terms change.
- **Operations:** Confirm capacity and inventory before launch.
- **Growth:** Check strategic fit and cannibalization.

## Disagreements
No live advisor reports are available in demo fallback mode.

## Recommended next steps
1. Restore the backend for a grounded analysis.
2. Confirm the missing business inputs.
3. Run a limited pilot before a full commitment.`;
  }

  const label = ADVISOR_LABELS[id] ?? id;
  const findings = ADVISOR_FINDINGS[id] ?? ['Validate the key assumptions before proceeding.'];
  return `# ${label} Report

> **Demo fallback report:** the backend was unavailable. Values below are not calculated from your inputs.

## Verdict
**Caution** — use this preview to explore the interface, then restore the backend for a grounded result.

## Summary
This mock report shows the structure produced by the ${label}. It intentionally avoids invented figures.

## Key findings
${findings.map((finding) => `- ${finding}`).join('\n')}

## Numbers
No calculated numbers are shown in fallback mode.

## Risks
- Backend and Ollama results are unavailable.
- Business assumptions have not been validated by domain tools.

## Recommendation
Restore the backend and rerun the decision before acting.

## Open questions
- Which inputs and assumptions should the live advisor verify?`;
}

export function startMockAnalysis(data: AnalyzeRequest): AnalyzeResponse {
  lastRequest = data;
  runStartedAt = Date.now();
  const runId = `mock_${crypto.randomUUID().slice(0, 8)}`;
  mockStatus = { state: 'running', run_id: runId, current_advisor: MOCK_ORDER[0], completed: [], order: MOCK_ORDER, error: null };
  return { run_id: runId, status: 'started' };
}

export function getMockStatus(): StatusResponse {
  if (mockStatus.state !== 'running') return mockStatus;
  const completedCount = Math.min(Math.floor((Date.now() - runStartedAt) / 900), MOCK_ORDER.length);
  const completed = MOCK_ORDER.slice(0, completedCount);
  mockStatus = completedCount === MOCK_ORDER.length
    ? { ...mockStatus, state: 'done', completed, current_advisor: null }
    : { ...mockStatus, completed, current_advisor: MOCK_ORDER[completedCount] };
  return mockStatus;
}

export function getMockReports(): ReportsResponse {
  const completed = getMockStatus().completed;
  const reports: ReportsResponse = {};
  completed.forEach((id) => { reports[id === 'front_desk' ? 'overview' : id] = buildReport(id === 'front_desk' ? 'overview' : id); });
  return reports;
}

export function getMockReport(id: string): ReportResponse {
  return { advisor: id, markdown: buildReport(id) };
}

export function getMockChat(id: string, message: string): ChatResponse {
  const label = ADVISOR_LABELS[id] ?? 'Front Desk';
  const decision = lastRequest?.decision ?? 'the selected decision';
  return {
    answer: `Demo fallback response from ${label}. The backend is unavailable, so I cannot run tools or verify figures for “${decision}”. For your question, “${message}”, the safest next step is to identify the required input, restore the backend, and rerun the grounded analysis.`,
  };
}
