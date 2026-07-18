import React from 'react';

export interface AdvisorCardProps {
  id: string;
  name: string;
  state: 'idle' | 'running' | 'done' | 'error';
  onClick?: () => void;
}

const ADVISOR_DETAILS: Record<string, {
  icon: string;
  description: string;
  checks: string[];
  output: string;
}> = {
  pricing: {
    icon: '💲',
    description: 'Tests how a price change may affect demand, margin, and customer retention.',
    checks: ['Elasticity', 'Margin', 'Segment churn'],
    output: 'A proceed, caution, or avoid verdict for the proposed price.',
  },
  revenue: {
    icon: '📈',
    description: 'Compares the decision against the status quo across a six-month forecast.',
    checks: ['Monthly forecast', 'Growth rate', 'Revenue range'],
    output: 'A grounded revenue outlook with assumptions and uncertainty.',
  },
  supplier: {
    icon: '🏭',
    description: 'Reviews supplier concentration, contract exposure, and renegotiation costs.',
    checks: ['Spend share', 'Dependency', 'Cost change'],
    output: 'Supply-chain risks and practical negotiation priorities.',
  },
  collections: {
    icon: '💰',
    description: 'Examines how the decision changes payment timing and working cash flow.',
    checks: ['DSO shift', 'Late payments', 'Cash exposure'],
    output: 'Expected collection pressure and customer payment risks.',
  },
  operations: {
    icon: '⚙️',
    description: 'Checks whether inventory, capacity, lead times, and staffing can support the plan.',
    checks: ['Utilization', 'Inventory', 'Stockout risk'],
    output: 'Operational constraints and the actions needed before launch.',
  },
  growth: {
    icon: '🚀',
    description: 'Looks beyond the immediate result to competitive position and durable growth.',
    checks: ['Cannibalization', 'Market response', 'Strategic fit'],
    output: 'Long-term opportunities, trade-offs, and positioning risks.',
  },
  overview: {
    icon: '🎯',
    description: 'Combines all six reports, surfaces disagreements, and weighs the full decision.',
    checks: ['Shared findings', 'Conflicts', 'Next steps'],
    output: 'One integrated verdict with two or three concrete actions.',
  },
};

export const AdvisorCard: React.FC<AdvisorCardProps> = ({
  id,
  name,
  state,
  onClick,
}) => {
  const details = ADVISOR_DETAILS[id] ?? ADVISOR_DETAILS.overview;
  const isClickable = state === 'done' && Boolean(onClick);
  const statusLabel = state === 'idle'
    ? 'Queued'
    : state === 'running'
      ? 'Thinking'
      : state === 'done'
        ? 'Open report →'
        : 'Analysis error';

  return (
    <article
      onClick={isClickable ? onClick : undefined}
      onKeyDown={(event) => {
        if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick?.();
        }
      }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`advisor-card state-${state} ${id === 'overview' ? 'advisor-card-overview' : ''}
        rounded-2xl border border-white/10 p-6 transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-950/30' : 'cursor-default'}
        ${state === 'error' ? 'border-red-500/30' : ''}
      `}
      style={{
        boxShadow: state === 'running' ? '0 0 24px rgba(168, 85, 247, 0.28)' : undefined,
      }}
    >
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between mb-5">
          <div className="advisor-icon text-xl" aria-hidden="true">{details.icon}</div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">{statusLabel}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${state === 'running' ? 'bg-purple-400 shadow-[0_0_16px_#a78bfa]' : state === 'done' ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : state === 'error' ? 'bg-red-400' : 'bg-gray-700'}`} />
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-[.18em] text-purple-300/70 mb-1">
          {id === 'overview' ? 'Final synthesis' : 'Domain specialist'}
        </p>
        <h3 className="text-lg font-semibold text-white mb-3">{name}</h3>
        <p className="text-sm leading-6 text-gray-400 mb-5">{details.description}</p>

        <div className="flex flex-wrap gap-2 mb-5" aria-label="Areas evaluated">
          {details.checks.map((check) => (
            <span key={check} className="advisor-tag rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider text-gray-400">
              {check}
            </span>
          ))}
        </div>

        <div className="mt-auto border-t border-white/[0.07] pt-4">
          <p className="text-[10px] uppercase tracking-[.16em] text-gray-600 mb-1">What you receive</p>
          <p className="text-xs leading-5 text-gray-400">{details.output}</p>
        </div>
      </div>
    </article>
  );
};

export default AdvisorCard;
