import React from 'react';
import type { Example } from '../lib/api';

interface PresetPickerProps {
  examples: Example[];
  onSelect: (example: Example) => void;
  loading?: boolean;
}

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
            key={example.id}
            onClick={() => onSelect(example)}
            disabled={loading}
            className="
              text-left p-4 rounded-lg border border-white/10 bg-white/[0.03]
              hover:border-accent/50 hover:bg-white/[0.08] transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <h4 className="font-semibold text-white mb-1">{example.name}</h4>
            <p className="text-xs text-gray-400">{example.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
