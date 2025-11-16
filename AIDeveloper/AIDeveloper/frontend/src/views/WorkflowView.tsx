import React from 'react';
import { useParams } from 'react-router-dom';
import { useWorkflowData } from '../hooks/useWorkflowData';
import { WorkflowChart } from '../components/WorkflowChart';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { WorkflowDataPanel } from '../components/WorkflowDataPanel';
import './WorkflowView.css';

/**
 * Main WorkflowView component displaying a modern, condensed workflow interface
 *
 * @security Assumes authenticated access; no direct user input in rendering.
 */
export const WorkflowView: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();

  if (!workflowId) {
    return <div>Error: Workflow ID not provided</div>;
  }

  const { metrics, timeline, loading, error } = useWorkflowData(workflowId);

  if (error) {
    return <div>Error loading workflow data: {error}</div>;
  }

  return (
    <div className="workflow-view">
      <h1>Workflow Overview</h1>
      <div className="workflow-grid">
        <div className="data-panel">
          <WorkflowDataPanel metrics={metrics} loading={loading} />
        </div>
        <div className="chart-section">
          <WorkflowChart metrics={metrics} loading={loading} />
        </div>
        <div className="timeline-section">
          <WorkflowTimeline timeline={timeline} loading={loading} />
        </div>
      </div>
    </div>
  );
};
