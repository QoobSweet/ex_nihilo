/**
 * WorkflowTimeline Component
 * 
 * Displays an interactive timeline visualization of workflow execution events,
 * showing task progression, status changes, and temporal relationships.
 * 
 * @security All data is sanitized before rendering to prevent XSS attacks
 */

import React, { useMemo } from 'react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { TimelineEvent, TimelineEventType, TaskStatus } from '../../types/workflow';
import DOMPurify from 'dompurify';

interface WorkflowTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

/**
 * Maps event types to display colors and icons
 */
const EVENT_CONFIG: Record<TimelineEventType, { color: string; icon: string; label: string }> = {
  [TimelineEventType.WORKFLOW_CREATED]: {
    color: 'bg-blue-500',
    icon: '🚀',
    label: 'Created'
  },
  [TimelineEventType.WORKFLOW_STARTED]: {
    color: 'bg-green-500',
    icon: '▶️',
    label: 'Started'
  },
  [TimelineEventType.TASK_STARTED]: {
    color: 'bg-yellow-500',
    icon: '⚙️',
    label: 'Task Started'
  },
  [TimelineEventType.TASK_COMPLETED]: {
    color: 'bg-green-600',
    icon: '✅',
    label: 'Task Completed'
  },
  [TimelineEventType.TASK_FAILED]: {
    color: 'bg-red-600',
    icon: '❌',
    label: 'Task Failed'
  },
  [TimelineEventType.REVIEW_REQUESTED]: {
    color: 'bg-purple-500',
    icon: '👀',
    label: 'Review Requested'
  },
  [TimelineEventType.REVIEW_COMPLETED]: {
    color: 'bg-purple-600',
    icon: '✓',
    label: 'Review Completed'
  },
  [TimelineEventType.WORKFLOW_COMPLETED]: {
    color: 'bg-green-700',
    icon: '🎉',
    label: 'Completed'
  },
  [TimelineEventType.WORKFLOW_FAILED]: {
    color: 'bg-red-700',
    icon: '💥',
    label: 'Failed'
  },
  [TimelineEventType.WORKFLOW_CANCELLED]: {
    color: 'bg-gray-600',
    icon: '🛑',
    label: 'Cancelled'
  }
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @security Uses DOMPurify to sanitize all user-generated content
 */
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code'],
    ALLOWED_ATTR: []
  });
}

/**
 * Formats a timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = parseISO(timestamp);
    return format(date, 'MMM d, yyyy HH:mm:ss');
  } catch (error) {
    console.error('Invalid timestamp format:', timestamp);
    return 'Invalid date';
  }
}

/**
 * Calculates time difference between two timestamps
 */
function getTimeDifference(start: string, end: string): string {
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const minutes = differenceInMinutes(endDate, startDate);
    
    if (minutes < 1) {
      return 'less than a minute';
    } else if (minutes === 1) {
      return '1 minute';
    } else if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Timeline event item component
 */
interface TimelineEventItemProps {
  event: TimelineEvent;
  isLast: boolean;
  previousTimestamp?: string;
}

const TimelineEventItem: React.FC<TimelineEventItemProps> = ({ 
  event, 
  isLast, 
  previousTimestamp 
}) => {
  const config = EVENT_CONFIG[event.event_type] || {
    color: 'bg-gray-500',
    icon: '•',
    label: 'Event'
  };

  const timeDiff = previousTimestamp 
    ? getTimeDifference(previousTimestamp, event.timestamp)
    : null;

  return (
    <div className="relative pb-8">
      {!isLast && (
        <span
          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-300"
          aria-hidden="true"
        />
      )}
      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <div
            className={`h-8 w-8 rounded-full ${config.color} flex items-center justify-center ring-8 ring-white`}
          >
            <span className="text-white text-sm" role="img" aria-label={config.label}>
              {config.icon}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {/* Sanitize title to prevent XSS */}
                <span dangerouslySetInnerHTML={{ 
                  __html: sanitizeHTML(event.title) 
                }} />
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                {/* Sanitize description to prevent XSS */}
                <span dangerouslySetInnerHTML={{ 
                  __html: sanitizeHTML(event.description) 
                }} />
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <time dateTime={event.timestamp}>
                {formatTimestamp(event.timestamp)}
              </time>
              {timeDiff && (
                <p className="text-xs text-gray-400 mt-1">
                  +{timeDiff}
                </p>
              )}
            </div>
          </div>
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {Object.entries(event.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span className="ml-2">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * WorkflowTimeline Component
 * 
 * Renders a chronological timeline of workflow events with visual indicators
 * for different event types and time differences between events.
 * 
 * @param props - Component props
 * @param props.events - Array of timeline events to display
 * @param props.className - Optional CSS class name
 * 
 * @security All user-generated content is sanitized using DOMPurify
 * @security Timestamps are validated before parsing
 */
export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ 
  events, 
  className = '' 
}) => {
  // Sort events by timestamp in descending order (most recent first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      try {
        return parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime();
      } catch (error) {
        console.error('Error sorting events:', error);
        return 0;
      }
    });
  }, [events]);

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>No timeline events available</p>
      </div>
    );
  }

  return (
    <div className={`workflow-timeline ${className}`}>
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Workflow Timeline
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {sortedEvents.map((event, index) => (
              <li key={event.id}>
                <TimelineEventItem
                  event={event}
                  isLast={index === sortedEvents.length - 1}
                  previousTimestamp={
                    index < sortedEvents.length - 1 
                      ? sortedEvents[index + 1].timestamp 
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTimeline;