import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WorkflowProvider } from './context/WorkflowContext';
import { useWorkflow } from './hooks/useWorkflow';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ApplicationShell } from './layouts/ApplicationShell';

function AppContent() {
  const { user } = useWorkflow();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<ApplicationShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <WorkflowProvider>
        <AppContent />
      </WorkflowProvider>
    </Router>
  );
}
