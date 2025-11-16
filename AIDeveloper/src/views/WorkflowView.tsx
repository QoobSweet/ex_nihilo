import React, { useState, useEffect } from 'react';
import WorkflowChart from '../components/WorkflowChart';
import TimelineComponent from '../components/TimelineComponent';
import { fetchWorkflowData, WorkflowData } from '../data/workflowData';
import '../styles/modernWorkflow.css';

interface WorkflowViewProps {
  workflowId: string;
}

/**
 * Main component for displaying the modernized Workflow view
 * @param workflowId - The ID of the workflow to display
 * @returns React component with condensed, modern layout including charts and timeline
 * @security Fetches data securely and validates inputs; no direct user input rendering
 */
const WorkflowView: React.FC<WorkflowViewProps> = ({ workflowId }) => {
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWorkflowData(workflowId);
        setWorkflowData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [workflowId]);

  if (loading) {
    return <div className="workflow-view">Loading...</div>;
  }

  if (error) {
    return <div className="workflow-view">Error: {error}</div>;
  }

  if (!workflowData) {
    return <div className="workflow-view">No data available</div>;
  }

  return (
    <div className="workflow-view">
      <div className="workflow-header">
        <h1>{workflowData.name}</h1>
        <span className={`workflow-status ${workflowData.status}`}>{workflowData.status}</span>
      </div>
      <div className="workflow-content">
        <div className="workflow-metrics">
          <h3>Metrics</h3>
          <p>Files Analyzed: {workflowData.metrics.filesAnalyzed}</p>
          <p>Lines of Code: {workflowData.metrics.linesOfCode}</p>
          <p>Created: {new Date(workflowData.createdAt).toLocaleDateString()}</p>
          <p>Updated: {new Date(workflowData.updatedAt).toLocaleDateString()}</p>
        </div>
        <WorkflowChart workflowData={workflowData} />
        <TimelineComponent workflowData={workflowData} />
      </div>
    </div>
  );
};

export default WorkflowView;