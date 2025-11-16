import React from 'react';
import { TimelineEvent } from '../types/workflow'; // Assuming types defined

interface WorkflowTimelineProps {
  events: TimelineEvent[];
}

/**
 * Component for rendering a visual timeline of workflow events.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @security Event descriptions are assumed sanitized; no direct user input rendering
 */
const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ events }) => {
  if (!Array.isArray(events) || events.length === 0) {
    return <div>No events to display in timeline.</div>;
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>Workflow Timeline</h3>
      <div style={{ position: 'relative', paddingLeft: '30px' }}>
        {events.map((event, index) => (
          <div key={event.id} style={{ marginBottom: '20px', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '-35px',
                top: '5px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
              }}
            ></div>
            {index < events.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '-30px',
                  top: '15px',
                  width: '2px',
                  height: '35px',
                  backgroundColor: '#007bff',
                }}
              ></div>
            )}
            <div>
              <strong>{event.title}</strong> - {event.date.toLocaleDateString()}
              <p>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowTimeline;