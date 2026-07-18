import { useState } from 'react';
import './App.css';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { LandingPage } from './components/LandingPage';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'chat'>('landing');
  const [selectedAdvisor, setSelectedAdvisor] = useState<{ id: string; name: string } | null>(null);

  const handleSelectAdvisor = (advisorId: string, name: string) => {
    setSelectedAdvisor({ id: advisorId, name });
    setCurrentView('chat');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAdvisor(null);
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="app-shell flex flex-col h-screen text-white">
      <header className="site-nav border-b backdrop-blur-xl px-5 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setCurrentView('landing')} className="group flex items-center gap-3 text-left">
            <span className="brand-mark w-9 h-9 rounded-xl" aria-hidden="true" />
            <span>
              <span className="block text-sm font-bold tracking-[0.16em] text-white">GEMMA-6</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 group-hover:text-purple-300 transition-colors">Decision intelligence</span>
            </span>
          </button>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="live-pill">Model ready</span>
            {currentView === 'chat' && selectedAdvisor && (
              <span className="hidden sm:block border-l border-white/10 pl-3">{selectedAdvisor.name}</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'dashboard' ? (
          <DashboardView onSelectAdvisor={handleSelectAdvisor} />
        ) : selectedAdvisor ? (
          <ChatView
            advisorId={selectedAdvisor.id}
            advisorName={selectedAdvisor.name}
            onBack={handleBackToDashboard}
          />
        ) : null}
      </main>
    </div>
  );
}

export default App;
