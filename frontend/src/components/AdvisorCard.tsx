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
      className={`
        rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]
        p-6 transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20' : 'cursor-default'}
        ${state === 'error' ? 'border-red-500/30' : ''}
      `}
      style={{
        boxShadow: state === 'running' ? '0 0 20px rgba(168, 85, 247, 0.3)' : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{icon}</div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">{name}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {state === 'idle' && 'Waiting'}
              {state === 'running' && 'Analyzing'}
              {state === 'done' && 'Complete'}
              {state === 'error' && 'Error'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state === 'running' && (
            <div className="relative w-3 h-3">
              <div
                className="absolute inset-0 rounded-full bg-accent"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            </div>
          )}
          {state === 'done' && (
            <div className="w-3 h-3 rounded-full bg-success flex items-center justify-center text-white text-xs">
              ✓
            </div>
          )}
          {state === 'idle' && (
            <div className="w-3 h-3 rounded-full bg-gray-600" />
          )}
          {state === 'error' && (
            <div className="w-3 h-3 rounded-full bg-red-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorCard;
