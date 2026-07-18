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
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header / Navigation */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentView('landing')}
            className="text-left"
          >
            <h1 className="text-2xl font-bold text-white">GEMMA-6</h1>
            <p className="text-sm text-gray-400">One model. Six advisors.</p>
          </button>
          <div className="text-sm text-gray-500">
            {currentView === 'chat' && selectedAdvisor && (
              <span>{selectedAdvisor.name}</span>
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
