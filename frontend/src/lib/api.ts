import {
  MOCK_EXAMPLES,
  getMockChat,
  getMockReport,
  getMockReports,
  getMockStatus,
  resetMockState,
  startMockAnalysis,
} from './mockData';

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

export interface ResetResponse {
  status: string;
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

export type ApiMode = 'backend' | 'mock';

let apiMode: ApiMode = 'backend';
const modeListeners = new Set<(mode: ApiMode) => void>();

function setApiMode(mode: ApiMode) {
  if (apiMode === mode) return;
  apiMode = mode;
  modeListeners.forEach((listener) => listener(mode));
}

export function getApiMode(): ApiMode {
  return apiMode;
}

export function subscribeToApiMode(listener: (mode: ApiMode) => void): () => void {
  modeListeners.add(listener);
  return () => modeListeners.delete(listener);
}

interface ApiError {
  status: number;
  error: ErrorResponse;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// API functions
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      status: 'error',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw { status: response.status, error } satisfies ApiError;
  }
  return response.json();
}

// Gemma runs tool-calling loops synchronously on chat endpoints (up to
// MAX_TOOL_STEPS Ollama round-trips) — a short timeout there reads as "down"
// when it's actually just thinking. Status/report reads stay snappy.
const DEFAULT_TIMEOUT_MS = 8000;
const GENERATION_TIMEOUT_MS = 180000;

// In local dev, Vite proxies relative /api calls to localhost:8000 (see
// vite.config.ts) so this stays empty. In production (e.g. the frontend on
// Vercel, backend on a self-hosted tunnel) there's no such proxy, so builds
// need VITE_API_BASE_URL set to the backend's public origin.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function fetchWithTimeout(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function withFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    const result = await request();
    setApiMode('backend');
    return result;
  } catch (error) {
    // The backend actually responded (even with an error status, e.g. a 503
    // "advisors are busy") — it's reachable, so surface the real error
    // instead of masking it as an offline demo fallback.
    if (isApiError(error)) throw error;
    console.warn('GEMMA-6 backend unavailable; using demo fallback data for this call.', error);
    setApiMode('mock');
    return fallback();
  }
}

export const api = {
  async analyze(data: AnalyzeRequest): Promise<AnalyzeResponse> {
    return withFallback(
      async () => handleResponse<AnalyzeResponse>(await fetchWithTimeout('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })),
      () => startMockAnalysis(data),
    );
  },

  async getStatus(): Promise<StatusResponse> {
    return withFallback(
      async () => handleResponse<StatusResponse>(await fetchWithTimeout('/api/status')),
      getMockStatus,
    );
  },

  async reset(): Promise<ResetResponse> {
    return withFallback(
      async () => handleResponse<ResetResponse>(await fetchWithTimeout('/api/reset', { method: 'POST' })),
      resetMockState,
    );
  },

  async getReports(): Promise<ReportsResponse> {
    return withFallback(
      async () => handleResponse<ReportsResponse>(await fetchWithTimeout('/api/reports')),
      getMockReports,
    );
  },

  async getReport(id: string): Promise<ReportResponse> {
    return withFallback(
      async () => handleResponse<ReportResponse>(await fetchWithTimeout(`/api/reports/${id}`)),
      () => getMockReport(id),
    );
  },

  async advisorChat(id: string, data: ChatRequest): Promise<ChatResponse> {
    return withFallback(
      async () => handleResponse<ChatResponse>(await fetchWithTimeout(`/api/advisor/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, GENERATION_TIMEOUT_MS)),
      () => getMockChat(id, data.message),
    );
  },

  async frontdeskChat(data: ChatRequest): Promise<ChatResponse> {
    return withFallback(
      async () => handleResponse<ChatResponse>(await fetchWithTimeout('/api/frontdesk/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, GENERATION_TIMEOUT_MS)),
      () => getMockChat('overview', data.message),
    );
  },

  async getExamples(): Promise<ExamplesResponse> {
    return withFallback(
      async () => handleResponse<ExamplesResponse>(await fetchWithTimeout('/api/examples')),
      () => ({ examples: MOCK_EXAMPLES }),
    );
  },
};
