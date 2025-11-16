import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkflowPage from './pages/WorkflowPage';
import helmet from 'helmet'; // Note: Helmet is typically server-side, but for demo

// Apply security headers (in a real app, this would be on server)
// For frontend, ensure CSP via meta tags or similar

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/workflows" element={<WorkflowPage />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;