import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Chains from './pages/Chains';
import ChainsList from './pages/ChainsList';
import ChainBuilder from './pages/ChainBuilder';
import ExecutionsList from './pages/ExecutionsList';
import ExecutionDetail from './pages/ExecutionDetail';
import AIAgent from './pages/AIAgent';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chains" replace />} />
        <Route path="/chains" element={<Chains />} />
        <Route path="/chains/list" element={<ChainsList />} />
        <Route path="/chains/builder" element={<ChainBuilder />} />
        <Route path="/chains/builder/:id" element={<ChainBuilder />} />
        <Route path="/executions" element={<ExecutionsList />} />
        <Route path="/executions/:id" element={<ExecutionDetail />} />
        <Route path="/ai-agent" element={<AIAgent />} />
      </Routes>
    </BrowserRouter>
  );
}
