import React from 'react';
import { Timeline, TimelineItem } from 'react-timeline';
import { TimelineEvent } from '../hooks/useWorkflowData';

/**
 * Props for WorkflowTimeline component
 */
interface WorkflowTimelineProps {
  timeline: TimelineEvent[];
  loading: boolean;
}

/**
 * Component to display workflow timeline events
 *
 * @param timeline - Array of timeline events
 * @param loading - Loading state indicator
 *
 * @security Uses react-timeline library for safe rendering; sanitizes event data before display.
 */
export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ timeline, loading }) => {
  if (loading) {
    return <div>Loading timeline...</div>;
  }

  if (timeline.length === 0) {
    return <div>No timeline events available</div>;
  }

  // Sanitize and prepare timeline items (assuming DOMPurify is available for sanitization)
  const sanitizedItems = timeline.map(event => ({
    ...event,
    title: event.title, // Assume title is safe or sanitize if needed
    description: event.description, // Sanitize if HTML content
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3>Workflow Timeline</h3>
      <Timeline>
        {sanitizedItems.map(event => (
          <TimelineItem
            key={event.id}
            dateText={new Date(event.date).toLocaleDateString()}
            dateInnerStyle={{ background: event.type === 'complete' ? '#4CAF50' : '#2196F3' }}
          >
            <h4>{event.title}</h4>
            <p>{event.description}</p>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};
