import React from 'react';
import { WorkflowMetrics } from '../hooks/useWorkflowData';

/**
 * Props for WorkflowDataPanel component
 */
interface WorkflowDataPanelProps {
  metrics: WorkflowMetrics | null;
  loading: boolean;
}

/**
 * Component to display key workflow metrics in a clean panel
 *
 * @param metrics - The workflow metrics data
 * @param loading - Loading state indicator
 *
 * @security Displays sanitized data only; no user input rendered directly.
 */
export const WorkflowDataPanel: React.FC<WorkflowDataPanelProps> = ({ metrics, loading }) => {
  if (loading) {
    return <div>Loading metrics...</div>;
  }

  if (!metrics) {
    return <div>No metrics available</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Workflow Summary</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        <div>
          <strong>Total Tasks:</strong> {metrics.taskCount}
        </div>
        <div>
          <strong>Completed:</strong> {metrics.completedTasks}
        </div>
        <div>
          <strong>In Progress:</strong> {metrics.inProgressTasks}
        </div>
        <div>
          <strong>Pending:</strong> {metrics.pendingTasks}
        </div>
      </div>
    </div>
  );
};
