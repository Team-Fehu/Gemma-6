import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface NotesPanelProps {
  markdown: string | null;
  loading?: boolean;
  title?: string;
  executive?: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  markdown,
  loading = false,
  title = 'Report',
  executive = false,
}) => {
  return (
    <aside className={`briefing-panel ${executive ? 'executive-briefing' : ''}`}>
      <header className="briefing-header">
        <div>
          <p className="decision-eyebrow">{executive ? 'Cross-functional synthesis' : 'Grounded specialist output'}</p>
          <h2>{title}</h2>
        </div>
        <div className="briefing-meta">
          <span className="briefing-status"><i /> Complete</span>
          <span className="briefing-type">Markdown</span>
        </div>
      </header>

      <div className="briefing-scroll">
        {loading ? (
          <div className="briefing-loading"><span /><p>Preparing the briefing…</p></div>
        ) : markdown ? (
          <article className="briefing-document">
            <ReactMarkdown
              components={{
                h1: (props) => <h1 {...props} />,
                h2: (props) => <h2 {...props} />,
                h3: (props) => <h3 {...props} />,
                p: (props) => <p {...props} />,
                ul: (props) => <ul {...props} />,
                ol: (props) => <ol {...props} />,
                li: (props) => <li {...props} />,
                blockquote: (props) => <blockquote {...props} />,
                strong: (props) => <strong {...props} />,
                em: (props) => <em {...props} />,
              } as Components}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="briefing-empty"><span>◇</span><h3>No briefing available</h3><p>Run the analysis to generate this report.</p></div>
        )}
      </div>
    </aside>
  );
};
