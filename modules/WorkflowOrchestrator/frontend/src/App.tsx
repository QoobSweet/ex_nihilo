import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workflows from './pages/Workflows';
import WorkflowDetail from './pages/WorkflowDetail';
import WorkflowTesting from './pages/WorkflowTesting';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/workflows" replace />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/workflows/:id" element={<WorkflowDetail />} />
        <Route path="/workflow-testing" element={<WorkflowTesting />} />
      </Routes>
    </BrowserRouter>
  );
}
