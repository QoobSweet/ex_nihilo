import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Workflow } from './components/Workflow';
import { WorkflowList } from './components/WorkflowList';
import './styles/workflow.css';

/**
 * Main Application Component
 * 
 * Configures routing for the AIDeveloper frontend application.
 * Provides navigation between dashboard, workflow list, and individual workflow views.
 * 
 * @component
 * @example
 * ```tsx
 * import { App } from './App';
 * 
 * ReactDOM.render(<App />, document.getElementById('root'));
 * ```
 * 
 * @security
 * - All routes require authentication (handled by middleware)
 * - Workflow routes validate ID parameters
 * - Protected routes redirect to login if unauthenticated
 */
const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Dashboard - Main landing page */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Workflow List - View all workflows */}
          <Route path="/workflows" element={<WorkflowList />} />
          
          {/* Individual Workflow - Detailed view with metrics and timeline */}
          <Route path="/workflows/:id" element={<Workflow />} />
          
          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;