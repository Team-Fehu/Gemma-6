import React, { useEffect, useState } from 'react';
import { api, getApiMode, subscribeToApiMode } from '../lib/api';
import type { ApiMode, BusinessContext, Example, StatusResponse } from '../lib/api';
import { AdvisorCard } from './AdvisorCard';
import { PresetPicker } from './PresetPicker';

interface DashboardViewProps {
  onSelectAdvisor: (advisorId: string, name: string) => void;
}

const ADVISOR_DISPLAY_NAMES: Record<string, string> = {
  pricing: 'Pricing Advisor',
  revenue: 'Revenue Forecasting',
  supplier: 'Supplier Advisor',
  collections: 'Collections Advisor',
  operations: 'Operations Advisor',
  growth: 'Growth Advisor',
  overview: 'Front Desk',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectAdvisor,
}) => {
  const [decision, setDecision] = useState('');
  const [businessContext, setBusinessContext] = useState<BusinessContext>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [examples, setExamples] = useState<Example[]>([]);
  const [status, setStatus] = useState<StatusResponse>({
    state: 'idle',
    run_id: '',
    current_advisor: null,
    completed: [],
    order: [],
    error: null,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<ApiMode>(getApiMode());

  useEffect(() => subscribeToApiMode(setApiMode), []);

  // Load examples + current backend status on mount (so a refresh mid-run, or
  // returning after reports already exist, reflects real state immediately).
  useEffect(() => {
    const loadExamples = async () => {
      try {
        const response = await api.getExamples();
        setExamples(response.examples);
      } catch (error) {
        console.error('Failed to load examples:', error);
      }
    };
    const loadStatus = async () => {
      try {
        const current = await api.getStatus();
        setStatus(current);
      } catch (error) {
        console.error('Failed to load status:', error);
      }
    };
    loadExamples();
    loadStatus();
  }, []);

  // Polling for status updates
  useEffect(() => {
    if (status.state !== 'running') return;

    const interval = setInterval(async () => {
      try {
        const newStatus = await api.getStatus();
        setStatus(newStatus);
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [status.state]);

  const handleSelectPreset = (example: Example) => {
    setDecision(example.decision);
    setBusinessContext(example.business_context);
    setJsonInput(JSON.stringify(example.business_context, null, 2));
  };

  const handleUpdateJsonInput = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setBusinessContext(parsed);
    } catch {
      // Invalid JSON, ignore for now
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision.trim()) {
      setToast('Please enter a decision');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const result = await api.analyze({
        decision: decision.trim(),
        business_context: businessContext,
      });
      setStatus({
        state: 'running',
        run_id: result.run_id,
        current_advisor: null,
        completed: [],
        order: [],
        error: null,
      });
    } catch (error: any) {
      if (error.status === 409) {
        setToast('Advisors are already thinking. Try again shortly.');
      } else {
        console.error('Analysis error:', error);
        setToast('Failed to start analysis. Please try again.');
      }
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (status.state === 'running') {
      setToast('Wait for the current run to finish before resetting.');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (!window.confirm('Clear the current results? This deletes all generated reports.')) return;
    try {
      await api.reset();
      setStatus({ state: 'idle', run_id: '', current_advisor: null, completed: [], order: [], error: null });
    } catch (error) {
      console.error('Reset error:', error);
      setToast('Failed to reset. Please try again.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getAdvisorState = (id: string): 'idle' | 'running' | 'done' | 'error' => {
    const pipelineId = id === 'overview' ? 'front_desk' : id;
    if (status.error) return 'error';
    if (status.completed.includes(pipelineId)) return 'done';
    if (status.current_advisor === pipelineId) return 'running';
    return 'idle';
  };

  const advisorIds = ['pricing', 'revenue', 'supplier', 'collections', 'operations', 'growth'];
  const progress = Math.round((status.completed.length / 7) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {toast && <div role="alert" className="fixed top-20 right-5 bg-red-950/80 backdrop-blur border border-red-400/30 text-red-100 px-5 py-3 rounded-xl z-50 animate-in shadow-2xl">{toast}</div>}

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {apiMode === 'mock' && (
            <div role="status" className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-5 py-4 text-amber-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.14em]">Demo fallback active</p>
                <p className="mt-1 text-xs leading-5 text-amber-100/65">The backend could not be reached. Pipeline progress, reports, and chat are simulated and contain no verified calculations.</p>
              </div>
              <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-wider">Mock data</span>
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[.24em] text-purple-300 mb-3">Decision workspace</p>
              <h1 className="font-serif-display text-4xl md:text-5xl mb-3">What should we examine?</h1>
              <p className="text-gray-500 max-w-xl">Choose a scenario or provide your own context. The six advisors will work through it one at a time.</p>
            </div>
            <div className="glass-panel rounded-2xl px-5 py-4 min-w-56">
              <div className="flex justify-between text-[10px] uppercase tracking-wider mb-3"><span className="text-gray-500">Pipeline</span><span className={status.state === 'running' ? 'text-purple-300' : 'text-gray-400'}>{status.state}</span></div>
              <div className="pipeline rounded-full"><span style={{ width: `${progress}%` }} /></div>
              <p className="text-xs text-gray-600 mt-2">{status.completed.length} of 7 stages complete</p>
              {status.state !== 'idle' && status.state !== 'running' && (
                <button type="button" onClick={handleReset} className="mt-3 text-[10px] uppercase tracking-wider text-gray-500 hover:text-red-300 transition-colors">
                  Reset results →
                </button>
              )}
            </div>
          </div>

          <section className="dashboard-hero glass-panel mb-10">
            <form onSubmit={handleRunAnalysis} className="space-y-7">
              {examples.length > 0 && <PresetPicker examples={examples} onSelect={handleSelectPreset} loading={loading} />}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="decision" className="text-xs font-semibold text-gray-300 uppercase tracking-[.15em]">Decision under test</label>
                  <span className="text-[10px] text-gray-600">Be specific for a stronger analysis</span>
                </div>
                <textarea id="decision" value={decision} onChange={(event) => setDecision(event.target.value)} placeholder="e.g. Should we raise the price of our top-selling product by 10%?" disabled={loading} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white text-base placeholder-gray-600 focus:outline-none focus:border-purple-400/50 focus:ring-4 focus:ring-purple-500/10 transition-all disabled:opacity-50 min-h-28 resize-none" />
              </div>

              <div>
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} aria-expanded={showAdvanced} className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-purple-300 uppercase tracking-wider transition-colors">
                  <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>›</span> Business context JSON
                </button>
                {showAdvanced && (
                  <div className="animate-in mt-4">
                    <textarea value={jsonInput} onChange={(event) => handleUpdateJsonInput(event.target.value)} placeholder={JSON.stringify({ industry: 'Bakery', annual_revenue: 250000 }, null, 2)} disabled={loading} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-cyan-100 placeholder-gray-700 focus:outline-none focus:border-cyan-400/40 font-mono text-sm min-h-40 resize-y" />
                    <p className="text-xs text-gray-600 mt-2">Valid JSON is used as the source for every grounded calculation.</p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading || !decision.trim()} className="primary-button w-full px-6 py-4 text-white font-semibold rounded-xl disabled:cursor-not-allowed">
                {loading ? 'Preparing advisors…' : status.state === 'running' ? 'Analysis in progress…' : 'Run six-advisor analysis →'}
              </button>
            </form>
          </section>

          <section className="mb-12" aria-labelledby="workflow-title">
            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[.2em] mb-1">How the analysis works</p>
              <h2 id="workflow-title" className="text-xl font-semibold mb-2">From one decision to an auditable recommendation</h2>
              <p className="text-sm leading-6 text-gray-500 max-w-2xl">Each specialist receives the same business context but stays inside its own domain. Calculators handle the numbers, reports preserve the evidence, and the Front Desk combines the findings.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              <div className="workflow-step rounded-2xl border border-white/[0.08] p-5">
                <span className="text-xs font-mono text-purple-300">01</span>
                <h3 className="font-semibold mt-3 mb-2">Provide the decision</h3>
                <p className="text-xs leading-5 text-gray-500">Choose a preset or enter a specific decision with the revenue, customer, supplier, and operations data behind it.</p>
              </div>
              <div className="workflow-step rounded-2xl border border-white/[0.08] p-5">
                <span className="text-xs font-mono text-cyan-300">02</span>
                <h3 className="font-semibold mt-3 mb-2">Six advisors calculate</h3>
                <p className="text-xs leading-5 text-gray-500">The model works sequentially. Deterministic tools calculate margins, forecasts, cash timing, capacity, and exposure.</p>
              </div>
              <div className="workflow-step rounded-2xl border border-white/[0.08] p-5">
                <span className="text-xs font-mono text-emerald-300">03</span>
                <h3 className="font-semibold mt-3 mb-2">Review and ask follow-ups</h3>
                <p className="text-xs leading-5 text-gray-500">Open each completed report, inspect formulas and risks, then chat with that advisor using the report as context.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[.2em] mb-1">Specialist team</p>
                <h2 className="text-xl font-semibold mb-2">Six focused perspectives</h2>
                <p className="text-sm text-gray-500">Every card explains the advisor's scope, checks, and expected report.</p>
              </div>
              {status.current_advisor && <span className="live-pill">{status.current_advisor} is thinking</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisorIds.map((id) => (
                <AdvisorCard
                  key={id}
                  id={id}
                  name={ADVISOR_DISPLAY_NAMES[id]}
                  state={getAdvisorState(id)}
                  onClick={() => getAdvisorState(id) === 'done' && onSelectAdvisor(id, ADVISOR_DISPLAY_NAMES[id])}
                />
              ))}
            </div>
          </section>

          <section className="mt-12 pb-10">
            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[.2em] mb-1">Integrated recommendation</p>
              <h2 className="text-xl font-semibold mb-2">The Front Desk connects the evidence</h2>
              <p className="text-sm leading-6 text-gray-500 max-w-2xl">After all specialists finish, the Front Desk names what each one found, highlights disagreements instead of hiding them, and turns the combined evidence into concrete next steps.</p>
            </div>
            <AdvisorCard id="overview" name={ADVISOR_DISPLAY_NAMES.overview} state={getAdvisorState('overview')} onClick={() => getAdvisorState('overview') === 'done' && onSelectAdvisor('overview', ADVISOR_DISPLAY_NAMES.overview)} />
          </section>
        </div>
      </div>
    </div>
  );
};
