import { useEffect, useState } from 'react';
import './App.css';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { LandingPage } from './components/LandingPage';
import { getApiMode, subscribeToApiMode } from './lib/api';
import logo from './assets/logo.png';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'chat'>('landing');
  const [selectedAdvisor, setSelectedAdvisor] = useState<{ id: string; name: string } | null>(null);
  const [apiMode, setApiMode] = useState(getApiMode());

  useEffect(() => subscribeToApiMode(setApiMode), []);

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
      <header className="app-header px-4 md:px-7 py-3">
        <div className="nav-command max-w-7xl mx-auto flex items-center justify-between gap-4 px-3 md:px-4 py-2.5">
          <button onClick={() => setCurrentView('landing')} className="nav-brand group flex items-center gap-3 text-left shrink-0" aria-label="Return to GEMMA-6 home">
            <span className="brand-emblem" aria-hidden="true">
              <img src={logo} alt="" />
            </span>
            <span>
              <span className="flex items-center gap-2 text-sm font-bold tracking-[0.16em] text-white">GEMMA-6 <span className="brand-version">LOCAL</span></span>
              <span className="block text-[9px] uppercase tracking-[0.22em] text-gray-500 group-hover:text-purple-300 transition-colors">Decision intelligence</span>
            </span>
          </button>

          <nav className="nav-switch hidden md:flex" aria-label="Workspace navigation">
            <button onClick={handleBackToDashboard} className={`nav-switch-item ${currentView === 'dashboard' ? 'active' : ''}`}>
              <span className="nav-item-icon">⌂</span> Workspace
            </button>
            {selectedAdvisor && (
              <button onClick={() => setCurrentView('chat')} className={`nav-switch-item ${currentView === 'chat' ? 'active' : ''}`}>
                <span className="nav-item-icon">✦</span> {selectedAdvisor.name}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className={`model-chip hidden sm:flex ${apiMode === 'mock' ? 'mock-mode' : ''}`}>
              <span className="model-orb" aria-hidden="true" />
              <span>
                <strong>{apiMode === 'mock' ? 'Demo fallback' : 'Gemma 3'}</strong>
                <small>{apiMode === 'mock' ? 'Mock data · Offline' : '4B · Ready'}</small>
              </span>
            </div>
            <button onClick={handleBackToDashboard} className="nav-action" aria-label="Start a new analysis">
              <span className="text-base leading-none">＋</span><span className="hidden sm:inline">New analysis</span>
            </button>
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
