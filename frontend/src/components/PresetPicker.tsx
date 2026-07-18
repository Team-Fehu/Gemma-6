import React from 'react';
import type { Example } from '../lib/api';

interface PresetPickerProps {
  examples: Example[];
  onSelect: (example: Example) => void;
  loading?: boolean;
}

const PRESET_ICONS: Record<string, string> = {
  bakery: '🥐',
  retail: '🛍️',
  manufacturer: '⚙️',
};

export const PresetPicker: React.FC<PresetPickerProps> = ({
  examples,
  onSelect,
  loading = false,
}) => {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Try a preset scenario
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {examples.map((example) => (
          <button
            type="button"
            key={example.id}
            onClick={() => onSelect(example)}
            disabled={loading}
            className="group text-left p-4 rounded-2xl border border-white/10 bg-black/20 hover:border-purple-400/40 hover:bg-purple-500/[0.07] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start justify-between mb-5"><span className="advisor-icon !w-10 !h-10 !rounded-xl text-lg">{PRESET_ICONS[example.id] || '◈'}</span><span className="text-gray-700 group-hover:text-purple-300 transition-colors">↗</span></div>
            <h4 className="font-semibold text-white mb-1.5">{example.name}</h4>
            <p className="text-xs leading-5 text-gray-500 line-clamp-2">{example.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
