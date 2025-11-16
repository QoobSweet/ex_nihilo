import React from 'react';
import { WorkflowDashboard } from '../components/WorkflowDashboard';

interface WorkflowViewProps {
  workflowId: string;
}

/**
 * Main view component for displaying the workflow.
 * Now uses the modern WorkflowDashboard component.
 *
 * @param workflowId - The workflow identifier
 */
export const WorkflowView: React.FC<WorkflowViewProps> = ({ workflowId }) => {
  return (
    <div>
      <WorkflowDashboard workflowId={workflowId} />
    </div>
  );
};
