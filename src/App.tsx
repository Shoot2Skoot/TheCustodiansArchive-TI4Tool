import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider, ToastContainer } from '@/components/common';
import { HomePage } from '@/features/game-setup/HomePage';
import { GameSetupWizard } from '@/features/game-setup/GameSetupWizard';
import { GamePage } from '@/features/game';
import { FactionOverviewPage } from '@/features/faction-overview/FactionOverviewPage';
import { StateManagementTest } from '@/features/test/StateManagementTest';
import { RealtimeTest } from '@/features/test/RealtimeTest';
import { ComponentShowcase } from '@/features/test/ComponentShowcase';
import { AudioTestPage } from '@/features/audio-test';
import { useEnsureSession } from '@/hooks';
import './App.css';

function App() {
  // Ensure anonymous session on app load
  useEnsureSession();

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Full-screen game page without header */}
          <Route path="/game/:gameId" element={<GamePage />} />

          {/* Faction overview page */}
          <Route path="/game/:gameId/factions" element={<FactionOverviewPage />} />

          {/* Routes with app layout */}
          <Route
            path="*"
            element={
              <div className="app">
                <main className="app-main">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/setup" element={<GameSetupWizard />} />
                    <Route path="/components" element={<ComponentsPage />} />
                    <Route path="/tests" element={<TestsPage />} />
                    <Route path="/audio-test" element={<AudioTestPage />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

function ComponentsPage() {
  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <a href="/" style={{ color: 'var(--color-accent-secondary)' }}>
          ← Back to Home
        </a>
      </div>
      <h2 style={{ color: 'var(--color-accent-primary)', marginBottom: 'var(--space-6)' }}>
        Component Library Showcase
      </h2>
      <ComponentShowcase />
    </div>
  );
}

function TestsPage() {
  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <a href="/" style={{ color: 'var(--color-accent-secondary)' }}>
          ← Back to Home
        </a>
      </div>
      <h2 style={{ color: 'var(--color-accent-primary)', marginBottom: 'var(--space-6)' }}>
        State Management Test Suites
      </h2>
      <p style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
        Test the state management infrastructure including database operations, Zustand store, and real-time synchronization.
      </p>

      <StateManagementTest />

      <div style={{ marginTop: 'var(--space-8)' }}>
        <RealtimeTest />
      </div>
    </div>
  );
}

export default App;
