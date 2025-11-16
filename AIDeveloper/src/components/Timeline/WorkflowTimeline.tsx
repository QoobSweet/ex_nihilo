import React from 'react';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface WorkflowTimelineProps {
  events: TimelineEvent[];
}

/**
 * Component for displaying a timeline of workflow events.
 *
 * @param events - Array of timeline events
 */
export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ events }) => {
  return (
    <div className="workflow-timeline">
      <h2>Workflow Timeline</h2>
      <div className="timeline-container">
        {events.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>{event.title}</h3>
              <time>{new Date(event.date).toLocaleDateString()}</time>
              <p>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
