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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !sessionId) return;

    const userMessage = input.trim();
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

  return (
    <div className="chat-shell flex-1 flex gap-0 overflow-hidden">
      <section className="chat-panel flex-1 flex flex-col min-w-0">
        <div className="border-b border-white/10 bg-black/20 px-5 md:px-7 py-4 flex items-center justify-between">
          <div><p className="text-[10px] uppercase tracking-[.18em] text-purple-300 mb-1">Advisor conversation</p><h2 className="text-lg font-semibold text-white">{advisorName}</h2></div>
          <button onClick={onBack} className="px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-gray-300 transition-colors">← Dashboard</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
              <div className="visual-core !relative !inset-auto !translate-x-0 !translate-y-0 !w-16 !h-16 mb-5">AI</div>
              <h3 className="text-xl font-semibold mb-2">Explore the analysis</h3>
              <p className="text-sm leading-6 text-gray-500">Ask about assumptions, risks, calculations, or what this advisor recommends next.</p>
            </div>
          ) : messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`message-bubble max-w-xs lg:max-w-md xl:max-w-lg px-5 py-3.5 rounded-2xl leading-6 ${message.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-br-md' : message.role === 'system' ? 'bg-amber-500/10 text-amber-200 text-sm border border-amber-500/20' : 'border border-white/10 bg-white/[0.055] text-gray-200 rounded-bl-md'}`}>{message.content}</div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className="message-bubble border border-white/10 bg-white/[0.05] px-5 py-4 rounded-2xl rounded-bl-md"><div className="flex gap-2">{[0,1,2].map((delay) => <span key={delay} className="w-2 h-2 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: `${delay * 0.12}s` }} />)}</div></div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 bg-black/20 px-5 md:px-7 py-5">
          <form onSubmit={handleSendMessage} className="flex gap-3 glass-panel rounded-2xl p-2">
            <label htmlFor="chat-message" className="sr-only">Message {advisorName}</label>
            <input id="chat-message" type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about this analysis…" disabled={loading} className="flex-1 min-w-0 bg-transparent px-3 py-2 text-white placeholder-gray-600 focus:outline-none disabled:opacity-50" />
            <button type="submit" disabled={loading || !input.trim()} className="primary-button px-5 py-2.5 text-sm text-white font-medium rounded-xl disabled:cursor-not-allowed">Send ↗</button>
          </form>
        </div>
      </section>

      {/* Notes Panel */}
      <NotesPanel
        markdown={report}
        loading={reportLoading}
        title={`${advisorName} Report`}
      />
    </div>
  );
};
