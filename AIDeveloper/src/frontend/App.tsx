import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import WorkflowView from './components/WorkflowView';
import Header from './components/Header';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/workflows" element={<ProtectedRoute><WorkflowView /></ProtectedRoute>} />
          {/* Other routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;