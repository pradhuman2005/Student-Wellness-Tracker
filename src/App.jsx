import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MoodLogger from './components/MoodLogger';
import Insights from './components/Insights';
import Support from './components/Support';
import Chatbot from './components/Chatbot';
import Auth from './components/Auth';
import ErrorBoundary from './components/ErrorBoundary';
import { WellnessProvider, useWellness } from './context/WellnessContext';

const AppContent = () => {
  const { token, loading } = useWellness();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading MindSync...</div>;
  }

  if (!token) {
    return <Auth />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="log" element={<MoodLogger />} />
          <Route path="insights" element={<Insights />} />
          <Route path="support" element={<Support />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <WellnessProvider>
      <AppContent />
    </WellnessProvider>
  );
}

export default App;
