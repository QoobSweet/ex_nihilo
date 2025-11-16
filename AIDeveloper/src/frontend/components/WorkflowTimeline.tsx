import React from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';
import { sanitizeInput } from '../utils/securityUtils';

interface WorkflowData {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  stats: { completed: number; pending: number; failed: number };
}

interface WorkflowTimelineProps {
  workflows: WorkflowData[];
}

/**
 * Workflow Timeline Component
 *
 * Displays an interactive timeline using React Flow.
 * Sanitizes all node data to prevent XSS.
 *
 * @param workflows - Array of workflow data
 * @returns JSX.Element
 */
const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ workflows }) => {
  const nodes = workflows.map((wf, index) => ({
    id: wf.id.toString(),
    data: { label: sanitizeInput(wf.name) },
    position: { x: index * 200, y: 100 },
  }));

  const edges = workflows.slice(1).map((wf, index) => ({
    id: `e${wf.id}`,
    source: workflows[index].id.toString(),
    target: wf.id.toString(),
  }));

  return (
    <div style={{ height: 400 }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default WorkflowTimeline;