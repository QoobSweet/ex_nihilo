import React, { useState, useEffect } from 'react';
import { WorkflowChart } from './charts/WorkflowChart';
import { WorkflowTimeline } from './timeline/WorkflowTimeline';
import { sanitizeHtml } from '../utils/security/sanitizer';
import { getWorkflowData } from '../services/api/workflowApi';
import { authHelper } from '../utils/auth/authHelper';

interface WorkflowData {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  tasks: Array<{ id: number; name: string; completed: boolean }>;
}

/**
 * Modern Workflow View Component
 *
 * Displays a clean, condensed view of workflows with charts and timeline.
 * Implements secure data fetching with JWT authentication and input sanitization.
 *
 * @security Requires authenticated user with workflow.read permission
 */
const ModernWorkflowView: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const token = authHelper.getToken();
        if (!token) {
          throw new Error('Authentication required');
        }
        const data = await getWorkflowData(token);
        // Sanitize all string data to prevent XSS
        const sanitizedData = data.map((wf: any) => ({
          ...wf,
          name: sanitizeHtml(wf.name),
          tasks: wf.tasks.map((task: any) => ({
            ...task,
            name: sanitizeHtml(task.name)
          }))
        }));
        setWorkflows(sanitizedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflows');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="modern-workflow-view" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <h2>Workflow Overview</h2>
        <ul>
          {workflows.map(wf => (
            <li key={wf.id} dangerouslySetInnerHTML={{ __html: wf.name }} />
          ))}
        </ul>
      </div>
      <div>
        <WorkflowChart data={workflows} />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <WorkflowTimeline workflows={workflows} />
      </div>
    </div>
  );
};

export default ModernWorkflowView;