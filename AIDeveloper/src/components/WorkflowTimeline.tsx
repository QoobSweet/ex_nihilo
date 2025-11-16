import React from 'react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface WorkflowTimelineProps {
  events: TimelineEvent[];
}

/**
 * WorkflowTimeline component displays a chronological timeline of workflow events.
 * Each event is shown with title, description, date, and status indicator.
 *
 * @param events - Array of timeline events with id, title, description, date, and status
 * @returns JSX.Element - The rendered timeline component
 *
 * @security All text content is sanitized via React's built-in escaping; no direct HTML injection
 */
const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ events }) => {
  return (
    <div className="workflow-timeline" style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>Workflow Timeline</h3>
      <div className="timeline-container" style={{ position: 'relative', paddingLeft: '30px' }}>
        {events.map((event, index) => (
          <div key={event.id} className="timeline-item" style={{ marginBottom: '20px', position: 'relative' }}>
            <div
              className="timeline-dot"
              style={{
                position: 'absolute',
                left: '-40px',
                top: '5px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: event.status === 'completed' ? '#82ca9d' : event.status === 'in-progress' ? '#ffc658' : '#ff7c7c',
                border: '2px solid #fff',
              }}
            ></div>
            {index !== events.length - 1 && (
              <div
                className="timeline-line"
                style={{
                  position: 'absolute',
                  left: '-34px',
                  top: '17px',
                  width: '2px',
                  height: 'calc(100% + 3px)',
                  backgroundColor: '#ddd',
                }}
              ></div>
            )}
            <div className="timeline-content" style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>{event.title}</h4>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#666' }}>{event.description}</p>
              <small style={{ color: '#999' }}>{event.date}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowTimeline;
