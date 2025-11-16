import React from 'react';

interface Workflow {
  id: number;
  name: string;
  createdAt: string;
  tasks: Array<{ id: number; name: string; completed: boolean }>;
}

interface WorkflowTimelineProps {
  workflows: Workflow[];
}

/**
 * Workflow Timeline Component
 *
 * Displays a chronological timeline of workflow executions.
 * Assumes data is sanitized before rendering.
 *
 * @param workflows - Sanitized workflow data
 */
const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ workflows }) => {
  return (
    <div className="workflow-timeline">
      <h3>Workflow Execution Timeline</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {workflows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(wf => (
          <div key={wf.id} style={{ borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
            <strong>{wf.name}</strong> - {new Date(wf.createdAt).toLocaleDateString()}
            <ul>
              {wf.tasks.map(task => (
                <li key={task.id} style={{ color: task.completed ? 'green' : 'red' }}>
                  {task.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export { WorkflowTimeline };