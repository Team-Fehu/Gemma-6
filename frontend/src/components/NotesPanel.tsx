import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface NotesPanelProps {
  markdown: string | null;
  loading?: boolean;
  title?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  markdown,
  loading = false,
  title = 'Report',
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white/[0.02] border-l border-white/10 overflow-hidden">
      <div className="sticky top-0 border-b border-white/10 bg-black/50 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading report...</div>
          </div>
        ) : markdown ? (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: (props) => <h1 className="text-2xl font-bold text-accent-light mt-6 mb-4" {...props} />,
                h2: (props) => <h2 className="text-xl font-bold text-accent mt-5 mb-3" {...props} />,
                h3: (props) => <h3 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />,
                p: (props) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                ul: (props) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                ol: (props) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                li: (props) => <li className="text-gray-300" {...props} />,
                blockquote: (props) => <blockquote className="border-l-4 border-accent pl-4 text-gray-400 italic mb-3" {...props} />,
                strong: (props) => <strong className="text-accent-light font-bold" {...props} />,
                em: (props) => <em className="text-gray-300 italic" {...props} />,
              } as Components}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">No report available</div>
        )}
      </div>
    </div>
  );
};
