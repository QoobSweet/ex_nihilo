import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { secureApi } from '../services/secureApi';
import { sanitizeInput } from '../utils/securityUtils';
import WorkflowChart from './WorkflowChart';
import WorkflowTimeline from './WorkflowTimeline';
import './Workflow.css';

interface WorkflowData {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  stats: { completed: number; pending: number; failed: number };
}

/**
 * Modern Workflow View Component
 *
 * Displays a condensed, interactive view of workflows with charts and timeline.
 * Implements secure data fetching and input sanitization.
 *
 * @security Requires authenticated user; all inputs sanitized to prevent XSS
 * @returns JSX.Element
 */
const WorkflowView: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    const fetchWorkflows = async () => {
      try {
        const response = await secureApi.get('/workflows');
        // Validate and sanitize data
        const sanitizedWorkflows = response.data.map((wf: any) => ({
          ...wf,
          name: sanitizeInput(wf.name),
          status: sanitizeInput(wf.status),
        }));
        setWorkflows(sanitizedWorkflows);
      } catch (err) {
        console.error('Failed to fetch workflows:', err);
        setError('Failed to load workflows. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Please log in to view workflows.</div>;
  }

  if (loading) {
    return <div>Loading workflows...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="workflow-view">
      <h1>Workflow Dashboard</h1>
      <WorkflowChart data={workflows} />
      <WorkflowTimeline workflows={workflows} />
    </div>
  );
};

export default WorkflowView;