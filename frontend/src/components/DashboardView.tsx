import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { BusinessContext, Example, StatusResponse } from '../lib/api';
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

  const getAdvisorState = (id: string): 'idle' | 'running' | 'done' | 'error' => {
    if (status.error) return 'error';
    if (status.completed.includes(id)) return 'done';
    if (status.current_advisor === id) return 'running';
    return 'idle';
  };

  const advisorIds = ['pricing', 'revenue', 'supplier', 'collections', 'operations', 'growth'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg z-50 animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Form Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <form onSubmit={handleRunAnalysis} className="space-y-6">
            {/* Preset Picker */}
            {examples.length > 0 && (
              <PresetPicker
                examples={examples}
                onSelect={handleSelectPreset}
                loading={loading}
              />
            )}

            {/* Decision Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Decision Under Test
              </label>
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="e.g., Raise prices on our top-selling bread loaf by 10%"
                disabled={loading}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors disabled:opacity-50 min-h-24 resize-none"
              />
            </div>

            {/* Advanced: Business Context JSON */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wider mb-3"
              >
                {showAdvanced ? '▼' : '▶'} Advanced: Edit Business Context
              </button>
              {showAdvanced && (
                <div>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => handleUpdateJsonInput(e.target.value)}
                    placeholder={JSON.stringify({ industry: 'Bakery', annual_revenue: 250000 }, null, 2)}
                    disabled={loading}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors disabled:opacity-50 font-mono text-sm min-h-32 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter valid JSON. This is merged with preset selections.
                  </p>
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={loading || !decision.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/30 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting Analysis...' : 'Run Analysis'}
            </button>
          </form>
        </div>

        {/* Advisor Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Six Advisors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisorIds.map((id) => (
                <AdvisorCard
                  key={id}
                  id={id}
                  name={ADVISOR_DISPLAY_NAMES[id]}
                  icon="💼"
                  state={getAdvisorState(id)}
                  onClick={() =>
                    getAdvisorState(id) === 'done' &&
                    onSelectAdvisor(id, ADVISOR_DISPLAY_NAMES[id])
                  }
                />
              ))}
            </div>
          </div>

          {/* Front Desk Card */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Overview & Recommendations
            </h3>
            <div
              onClick={() =>
                getAdvisorState('overview') === 'done' &&
                onSelectAdvisor('overview', ADVISOR_DISPLAY_NAMES['overview'])
              }
              className="w-full"
            >
              <AdvisorCard
                id="overview"
                name={ADVISOR_DISPLAY_NAMES['overview']}
                icon="🎯"
                state={getAdvisorState('overview')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
