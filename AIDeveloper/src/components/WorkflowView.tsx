import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChartComponent from './ChartComponent';
import TimelineComponent from './TimelineComponent';
import { sanitizeHtml } from '../security/sanitizationUtils';

interface Workflow {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface WorkflowViewProps {
  userId: number;
}

/**
 * Modern, condensed Workflow view component
 * Features clean UI with charts and timeline
 * @param userId - The authenticated user ID
 */
const WorkflowView: React.FC<WorkflowViewProps> = ({ userId }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workflowsRes, statsRes] = await Promise.all([
          axios.get(`/api/workflows?userId=${userId}&limit=10`),
          axios.get('/api/workflows/stats'),
        ]);
        setWorkflows(workflowsRes.data.workflows);
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="workflow-view">
      <h1 className="title">Workflow Dashboard</h1>
      <div className="grid-container">
        <div className="chart-section">
          <ChartComponent data={stats} />
        </div>
        <div className="timeline-section">
          <TimelineComponent workflows={workflows} />
        </div>
        <div className="list-section">
          <h2>Recent Workflows</h2>
          <ul className="workflow-list">
            {workflows.map((wf) => (
              <li key={wf.id} className="workflow-item">
                <h3 dangerouslySetInnerHTML={{ __html: sanitizeHtml(wf.name) }} />
                <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(wf.description) }} />
                <span className={`status ${wf.status}`}>{wf.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkflowView;