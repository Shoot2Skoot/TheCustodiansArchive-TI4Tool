import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider, ToastContainer } from '@/components/common';
import { DatabaseTest } from '@/features/test/DatabaseTest';
import { ComponentShowcase } from '@/features/test/ComponentShowcase';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <h1>The Custodians Archive</h1>
            <p>Twilight Imperium 4 Dashboard</p>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/components" element={<ComponentsPage />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <h2>Welcome to The Custodians Archive</h2>
      <p>Project initialized successfully!</p>
      <ul>
        <li>✓ React + TypeScript</li>
        <li>✓ Vite</li>
        <li>✓ React Router</li>
        <li>✓ Zustand (state management)</li>
        <li>✓ Supabase client</li>
        <li>✓ ESLint + Prettier</li>
        <li>✓ Database schema deployed</li>
        <li>✓ Row Level Security configured</li>
        <li>✓ Component library built</li>
      </ul>

      <p style={{ marginTop: 'var(--space-6)' }}>
        <a href="/components" style={{ color: 'var(--color-accent-primary)' }}>
          → View Component Showcase
        </a>
      </p>

      <DatabaseTest />
    </div>
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

export default App;
