import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { NotesPanel } from './NotesPanel';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatViewProps {
  advisorId: string;
  advisorName: string;
  onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  advisorId,
  advisorName,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session ID and load report
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem(`session_${advisorId}`);
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      sessionStorage.setItem(`session_${advisorId}`, newSessionId);
    }

    // Load report
    const loadReport = async () => {
      try {
        setReportLoading(true);
        const response = await api.getReport(advisorId);
        setReport(response.markdown);
      } catch (error) {
        console.error('Failed to load report:', error);
      } finally {
        setReportLoading(false);
      }
    };

    loadReport();
  }, [advisorId]);

  const isFrontDesk = advisorId === 'overview';
  const suggestedQuestions = isFrontDesk
    ? [
        'What is the strongest reason to proceed?',
        'Where do the advisors disagree?',
        'What should I validate before deciding?',
      ]
    : [
        'What is the biggest risk?',
        'Which assumption matters most?',
        'What should I do next?',
      ];

  const sendMessage = async (message: string) => {
    const userMessage = message.trim();
    if (!userMessage || loading || !sessionId) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      let response;
      if (advisorId === 'overview') {
        response = await api.frontdeskChat({ message: userMessage, session_id: sessionId });
      } else {
        response = await api.advisorChat(advisorId, { message: userMessage, session_id: sessionId });
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (error: any) {
      if (error.status === 503) {
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: 'Advisors are still thinking. Please try again in a moment.' },
        ]);
      } else if (error.status === 404) {
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: 'Report not available yet. Please run the analysis first.' },
        ]);
      } else {
        console.error('Chat error:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: 'Failed to send message. Please try again.' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className={`decision-room flex-1 flex overflow-hidden ${isFrontDesk ? 'front-desk-room' : ''}`}>
      <section className="conversation-pane flex flex-col min-w-0">
        <header className="decision-header">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`decision-avatar ${isFrontDesk ? 'front-desk-avatar' : ''}`} aria-hidden="true">
              {isFrontDesk ? 'FD' : 'AI'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="decision-eyebrow">{isFrontDesk ? 'Executive synthesis' : 'Specialist review'}</p>
                <span className="decision-live"><span /> Ready</span>
              </div>
              <h1 className="truncate text-xl font-semibold text-white">{advisorName}</h1>
              <p className="hidden sm:block text-xs text-gray-500 mt-1">
                {isFrontDesk ? 'Ask across all six specialist reports and surface conflicts.' : 'Ask follow-up questions grounded in this specialist report.'}
              </p>
            </div>
          </div>
          <button onClick={onBack} className="decision-back">← <span className="hidden sm:inline">Decision workspace</span></button>
        </header>

        {isFrontDesk && (
          <div className="evidence-strip" aria-label="Evidence sources">
            <span className="evidence-label">Evidence set</span>
            {['Pricing', 'Revenue', 'Supplier', 'Collections', 'Operations', 'Growth'].map((label) => (
              <span key={label} className="evidence-chip"><span>✓</span>{label}</span>
            ))}
          </div>
        )}

        <div className="conversation-scroll flex-1 overflow-y-auto px-5 md:px-8 py-7">
          {messages.length === 0 ? (
            <div className="conversation-welcome">
              <div className="welcome-symbol" aria-hidden="true">{isFrontDesk ? '✦' : '↗'}</div>
              <p className="decision-eyebrow mb-2">{isFrontDesk ? 'Decision intelligence' : 'Report intelligence'}</p>
              <h2>{isFrontDesk ? 'Interrogate the recommendation.' : 'Go deeper on the report.'}</h2>
              <p>{isFrontDesk ? 'The Front Desk has read every specialist report. Ask it to compare evidence, explain tension, or turn findings into an action plan.' : 'Explore assumptions, calculations, risks, and the advisor’s recommended next move.'}</p>
              <div className="prompt-grid">
                {suggestedQuestions.map((question, index) => (
                  <button key={question} type="button" onClick={() => void sendMessage(question)} disabled={loading || !sessionId}>
                    <span>0{index + 1}</span>{question}<b>↗</b>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message, index) => (
                <div key={index} className={`message-row ${message.role}`}>
                  {message.role !== 'user' && <span className="message-avatar">{message.role === 'system' ? '!' : isFrontDesk ? 'FD' : 'AI'}</span>}
                  <div>
                    <p className="message-author">{message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : advisorName}</p>
                    <div className="message-bubble">{message.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-row assistant">
                  <span className="message-avatar">{isFrontDesk ? 'FD' : 'AI'}</span>
                  <div><p className="message-author">{advisorName}</p><div className="message-bubble thinking"><span /><span /><span /></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="composer-zone">
          <form onSubmit={handleSendMessage} className="decision-composer">
            <label htmlFor="chat-message" className="sr-only">Message {advisorName}</label>
            <input id="chat-message" type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder={isFrontDesk ? 'Ask the Front Desk to compare, explain, or recommend…' : 'Ask about this specialist analysis…'} disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">↗</button>
          </form>
          <p>Answers are grounded in the generated reports. Verify critical decisions independently.</p>
        </footer>
      </section>

      <NotesPanel markdown={report} loading={reportLoading} title={isFrontDesk ? 'Executive Briefing' : `${advisorName} Report`} executive={isFrontDesk} />
    </div>
  );
};
