import React from 'react';
import { processTimelineData, WorkflowData } from '../data/workflowData';

interface TimelineComponentProps {
  workflowData: WorkflowData;
}

/**
 * Component for displaying a timeline of workflow events
 * @param workflowData - The workflow data containing timeline events
 * @returns React component with a vertical timeline
 * @security Event text is sanitized to prevent XSS
 */
const TimelineComponent: React.FC<TimelineComponentProps> = ({ workflowData }) => {
  const timelineEvents = processTimelineData(workflowData);

  return (
    <div className="workflow-timeline" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3>Workflow Timeline</h3>
      <div style={{ position: 'relative', paddingLeft: '30px' }}>
        {timelineEvents.map((event, index) => (
          <div key={index} style={{ marginBottom: '20px', position: 'relative' }}>
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
            <div style={{ borderLeft: '2px solid #007bff', paddingLeft: '20px', marginLeft: '-30px' }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>
                {new Date(event.timestamp).toLocaleString()}
              </p>
              <p style={{ margin: '5px 0' }}>
                {/* Sanitize event text to prevent XSS */}
                {event.event.replace(/[<>]/g, '')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineComponent;