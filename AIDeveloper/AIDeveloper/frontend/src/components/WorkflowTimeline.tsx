import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import DOMPurify from 'dompurify';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface WorkflowTimelineProps {
  events: TimelineEvent[];
}

/**
 * WorkflowTimeline component displays a vertical timeline of workflow events.
 *
 * @param events - Array of timeline events with date, title, and description
 * @returns JSX element rendering a vertical timeline
 *
 * @security Sanitizes title and description before rendering to prevent XSS
 */
const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ events }) => {
  // Sanitize event data for display
  const sanitizedEvents = events.map(event => ({
    ...event,
    title: DOMPurify.sanitize(event.title),
    description: DOMPurify.sanitize(event.description),
  }));

  return (
    <div className="workflow-timeline">
      <h3>Workflow Timeline</h3>
      <VerticalTimeline>
        {sanitizedEvents.map((event, index) => (
          <VerticalTimelineElement
            key={index}
            date={event.date}
            icon={event.icon}
            iconStyle={{ background: '#4BC0C0', color: '#fff' }}
          >
            <h4 className="vertical-timeline-element-title" dangerouslySetInnerHTML={{ __html: event.title }} />
            <p dangerouslySetInnerHTML={{ __html: event.description }} />
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div>
  );
};

export default WorkflowTimeline;