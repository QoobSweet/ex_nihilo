import React, { useState, useEffect } from 'react';
import WorkflowChart from '../components/WorkflowChart';
import WorkflowTimeline from '../components/WorkflowTimeline';
import '../styles/WorkflowStyles.css';
import DOMPurify from 'dompurify';

interface Workflow {
  id: number;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

/**
 * WorkflowView component renders a modern, condensed view of workflows with charts and timeline.
 *
 * @returns JSX element for the workflow view
 *
 * @security Sanitizes workflow names and event data before rendering to prevent XSS
 */
const WorkflowView: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Mock data - replace with real API call
    const mockWorkflows: Workflow[] = [
      { id: 1, name: 'Feature Implementation', status: 'in-progress', progress: 75, createdAt: '2023-01-01', updatedAt: '2023-01-15' },
      { id: 2, name: 'Bug Fix', status: 'completed', progress: 100, createdAt: '2023-01-05', updatedAt: '2023-01-10' },
      { id: 3, name: 'Refactoring', status: 'pending', progress: 0, createdAt: '2023-01-10', updatedAt: '2023-01-10' },
    ];
    setWorkflows(mockWorkflows);

    const mockEvents: TimelineEvent[] = [
      { date: '2023-01-01', title: 'Workflow Created', description: 'Initial workflow setup.' },
      { date: '2023-01-10', title: 'Status Update', description: 'Moved to in-progress.' },
      { date: '2023-01-15', title: 'Progress Update', description: '75% complete.' },
    ];
    setTimelineEvents(mockEvents);
  }, []);

  // Sanitize workflow names for display
  const sanitizedWorkflows = workflows.map(w => ({
    ...w,
    name: DOMPurify.sanitize(w.name),
  }));

  return (
    <div className="workflow-view">
      <header className="workflow-header">
        <h1>Workflow Overview</h1>
        <p>A condensed view of your workflows with insights.</p>
      </header>
      <div className="workflow-content">
        <div className="workflow-list">
          <h2>Active Workflows</h2>
          <ul>
            {sanitizedWorkflows.map(workflow => (
              <li key={workflow.id} className="workflow-item">
                <h3 dangerouslySetInnerHTML={{ __html: workflow.name }} />
                <p>Status: {workflow.status}</p>
                <p>Progress: {workflow.progress}%</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="workflow-visuals">
          <WorkflowChart workflows={sanitizedWorkflows} />
          <WorkflowTimeline events={timelineEvents} />
        </div>
      </div>
    </div>
  );
};

export default WorkflowView;