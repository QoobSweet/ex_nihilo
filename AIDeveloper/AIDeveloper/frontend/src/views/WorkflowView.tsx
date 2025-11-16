import React, { useEffect, useState } from 'react';
import WorkflowChart from '../components/WorkflowChart';
import WorkflowTimeline from '../components/WorkflowTimeline';
import {
  transformWorkflowsForStatusChart,
  transformWorkflowsForTimeline,
  transformWorkflowsForProgressChart,
} from '../utils/dataTransformers';
import { WorkflowData } from '../types/workflow'; // Assuming types defined
import './WorkflowView.css';

/**
 * Main view component for displaying workflows with modern UI, charts, and timeline.
 *
 * @returns JSX element
 *
 * @security Fetches data from API; assumes API responses are sanitized server-side
 */
const WorkflowView: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        // Assuming fetch from API; replace with actual endpoint
        const response = await fetch('/api/workflows');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data: WorkflowData[] = await response.json();
        setWorkflows(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  if (loading) return <div>Loading workflows...</div>;
  if (error) return <div>Error: {error}</div>;

  const statusChartData = transformWorkflowsForStatusChart(workflows);
  const timelineEvents = transformWorkflowsForTimeline(workflows);
  const progressChartData = transformWorkflowsForProgressChart(workflows);

  return (
    <div className="workflow-view">
      <h1>Workflow Dashboard</h1>
      <div className="workflow-grid">
        <div className="workflow-list">
          <h2>Workflows</h2>
          <ul>
            {workflows.map(workflow => (
              <li key={workflow.id} className="workflow-item">
                <strong>{workflow.name}</strong> - Status: {workflow.status} - Progress: {workflow.progress}%
              </li>
            ))}
          </ul>
        </div>
        <div className="workflow-charts">
          <WorkflowChart data={statusChartData} type="pie" title="Workflow Status Distribution" />
          <WorkflowChart data={progressChartData} type="bar" title="Workflow Progress" />
        </div>
        <div className="workflow-timeline">
          <WorkflowTimeline events={timelineEvents} />
        </div>
      </div>
    </div>
  );
};

export default WorkflowView;