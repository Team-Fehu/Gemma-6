// API types
export interface BusinessContext {
  [key: string]: any;
}

export interface AnalyzeRequest {
  business_context: BusinessContext;
  decision: string;
}

export interface AnalyzeResponse {
  run_id: string;
  status: string;
}

export interface StatusResponse {
  state: 'idle' | 'running' | 'done' | 'error';
  run_id: string;
  current_advisor: string | null;
  completed: string[];
  order: string[];
  error: string | null;
}

export interface ReportsResponse {
  [key: string]: string;
}

export interface ReportResponse {
  advisor: string;
  markdown: string;
}

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  answer: string;
}

export interface Example {
  id: string;
  name: string;
  description: string;
  business_context: BusinessContext;
  decision: string;
}

export interface ExamplesResponse {
  examples: Example[];
}

export interface ErrorResponse {
  status: string;
  message: string;
}

// API functions
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      status: 'error',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw { status: response.status, error };
  }
  return response.json();
}

export const api = {
  // Start analysis
  async analyze(data: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AnalyzeResponse>(response);
  },

  // Get current status
  async getStatus(): Promise<StatusResponse> {
    const response = await fetch('/api/status', { method: 'GET' });
    return handleResponse<StatusResponse>(response);
  },

  // Get all reports
  async getReports(): Promise<ReportsResponse> {
    const response = await fetch('/api/reports', { method: 'GET' });
    return handleResponse<ReportsResponse>(response);
  },

  // Get single report
  async getReport(id: string): Promise<ReportResponse> {
    const response = await fetch(`/api/reports/${id}`, { method: 'GET' });
    return handleResponse<ReportResponse>(response);
  },

  // Chat with advisor
  async advisorChat(id: string, data: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`/api/advisor/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ChatResponse>(response);
  },

  // Chat with front desk
  async frontdeskChat(data: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/frontdesk/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ChatResponse>(response);
  },

  // Get example scenarios
  async getExamples(): Promise<ExamplesResponse> {
    const response = await fetch('/api/examples', { method: 'GET' });
    return handleResponse<ExamplesResponse>(response);
  },
};
