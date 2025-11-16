import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { FiCheckCircle, FiClock, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import DOMPurify from 'dompurify';

/**
 * Represents a single event in the workflow timeline
 */
interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'task_created' | 'task_started' | 'task_completed' | 'task_failed' | 'agent_action' | 'review' | 'error';
  title: string;
  description?: string;
  agent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Props for the WorkflowTimeline component
 */
interface WorkflowTimelineProps {
  /** Array of timeline events to display */
  events: TimelineEvent[];
  /** Optional CSS class name */
  className?: string;
}

/**
 * Maps event types to their visual representation
 */
const EVENT_CONFIG = {
  task_created: {
    icon: FiClock,
    color: '#3b82f6',
    label: 'Created'
  },
  task_started: {
    icon: FiClock,
    color: '#f59e0b',
    label: 'Started'
  },
  task_completed: {
    icon: FiCheckCircle,
    color: '#10b981',
    label: 'Completed'
  },
  task_failed: {
    icon: FiXCircle,
    color: '#ef4444',
    label: 'Failed'
  },
  agent_action: {
    icon: FiClock,
    color: '#8b5cf6',
    label: 'Agent Action'
  },
  review: {
    icon: FiAlertCircle,
    color: '#06b6d4',
    label: 'Review'
  },
  error: {
    icon: FiXCircle,
    color: '#ef4444',
    label: 'Error'
  }
} as const;

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @param content - Raw HTML content to sanitize
 * @returns Sanitized HTML string safe for rendering
 * @security Prevents XSS by sanitizing all HTML content before rendering
 */
function sanitizeHTML(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre'],
    ALLOWED_ATTR: []
  });
}

/**
 * Formats a timestamp for display in the timeline
 * 
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted date and time string
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MMM d, yyyy HH:mm:ss');
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
}

/**
 * WorkflowTimeline Component
 * 
 * Displays a chronological timeline of workflow events including task transitions,
 * agent actions, and reviews. Provides visual indicators for different event types
 * and supports expandable event details.
 * 
 * @component
 * @example
 * ```tsx
 * const events = [
 *   {
 *     id: '1',
 *     timestamp: '2024-01-15T10:30:00Z',
 *     type: 'task_created',
 *     title: 'Planning task created',
 *     description: 'Initial planning phase started'
 *   }
 * ];
 * 
 * <WorkflowTimeline events={events} />
 * ```
 * 
 * @security All user-provided content is sanitized before rendering to prevent XSS
 */
export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ events, className = '' }) => {
  // Sort events by timestamp in descending order (most recent first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
  }, [events]);

  if (events.length === 0) {
    return (
      <div className={`workflow-timeline-empty ${className}`}>
        <p>No timeline events available</p>
      </div>
    );
  }

  return (
    <div className={`workflow-timeline ${className}`}>
      <div className="timeline-header">
        <h3>Timeline</h3>
        <span className="timeline-count">{events.length} events</span>
      </div>
      
      <div className="timeline-container">
        {sortedEvents.map((event, index) => {
          const config = EVENT_CONFIG[event.type];
          const Icon = config.icon;
          
          return (
            <div key={event.id} className="timeline-event">
              <div className="timeline-marker">
                <div 
                  className="timeline-icon"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon size={16} color="white" />
                </div>
                {index < sortedEvents.length - 1 && (
                  <div className="timeline-line" />
                )}
              </div>
              
              <div className="timeline-content">
                <div className="timeline-event-header">
                  <span 
                    className="timeline-event-type"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                  <span className="timeline-event-time">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                
                <h4 className="timeline-event-title">
                  {/* Sanitize title to prevent XSS */}
                  {event.title}
                </h4>
                
                {event.description && (
                  <p 
                    className="timeline-event-description"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHTML(event.description) 
                    }}
                  />
                )}
                
                {event.agent && (
                  <div className="timeline-event-agent">
                    <span className="agent-label">Agent:</span>
                    <span className="agent-name">{event.agent}</span>
                  </div>
                )}
                
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <details className="timeline-event-metadata">
                    <summary>View Details</summary>
                    <pre className="metadata-content">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTimeline;