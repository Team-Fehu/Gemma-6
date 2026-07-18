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
    <div className="flex-1 flex gap-0">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{advisorName}</h2>
          <button
            onClick={onBack}
            className="px-3 py-1 text-sm rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
          >
            Back
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Start a conversation about this advisor's analysis.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-none'
                      : msg.role === 'system'
                      ? 'bg-yellow-500/20 text-yellow-200 text-sm italic border border-yellow-500/30 rounded-lg'
                      : 'bg-white/10 text-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-white/5 px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this analysis..."
              disabled={loading}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-accent hover:bg-accent-light disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Notes Panel */}
      <NotesPanel
        markdown={report}
        loading={reportLoading}
        title={`${advisorName} Report`}
      />
    </div>
  );
};
