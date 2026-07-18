import React from 'react';

export interface AdvisorCardProps {
  id: string;
  name: string;
  icon: string;
  state: 'idle' | 'running' | 'done' | 'error';
  onClick?: () => void;
}

const ADVISOR_ICONS: Record<string, string> = {
  pricing: '💲',
  revenue: '📈',
  supplier: '🏭',
  collections: '💰',
  operations: '⚙️',
  growth: '🚀',
  overview: '🎯',
};

export const AdvisorCard: React.FC<AdvisorCardProps> = ({
  id,
  name,
  state,
  onClick,
}) => {
  const icon = ADVISOR_ICONS[id] || '💼';
  const isClickable = state === 'done' || state === 'error';

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`advisor-card state-${state}
        rounded-2xl border border-white/10 p-6 transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-950/30' : 'cursor-default'}
        ${state === 'error' ? 'border-red-500/30' : ''}
      `}
      style={{
        boxShadow: state === 'running' ? '0 0 20px rgba(168, 85, 247, 0.3)' : undefined,
      }}
    >
      <div className="relative flex flex-col h-full justify-between gap-7">
        <div className="flex items-start justify-between">
          <div className="advisor-icon text-xl" aria-hidden="true">{icon}</div>
          <div className={`w-2.5 h-2.5 rounded-full ${state === 'running' ? 'bg-purple-400 shadow-[0_0_16px_#a78bfa]' : state === 'done' ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : state === 'error' ? 'bg-red-400' : 'bg-gray-700'}`} />
        </div>
        <div className="text-left">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-[10px] uppercase tracking-[.18em] text-gray-600 mb-1">{id === 'overview' ? 'Synthesis' : 'Specialist'}</p><h3 className="text-base font-semibold text-white">{name}</h3></div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">{state === 'idle' ? 'Queued' : state === 'running' ? 'Thinking' : state === 'done' ? 'Open report →' : 'Error'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorCard;
