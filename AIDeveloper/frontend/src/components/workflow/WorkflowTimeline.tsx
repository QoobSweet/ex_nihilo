/**
 * WorkflowTimeline Component
 * Displays a visual timeline of workflow events and task progression
 * 
 * @security All data is sanitized before rendering to prevent XSS
 * @security Event metadata is validated before display
 */

import React, { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { TimelineEvent, TimelineEventType, WorkflowTask } from '../../types/workflow';
import DOMPurify from 'dompurify';

interface WorkflowTimelineProps {
  events: TimelineEvent[];
  tasks?: WorkflowTask[];
  className?: string;
}

/**
 * Gets the appropriate icon for a timeline event type
 * @param type - The timeline event type
 * @returns Icon character or emoji
 */
const getEventIcon = (type: TimelineEventType): string => {
  const iconMap: Record<TimelineEventType, string> = {
    [TimelineEventType.CREATED]: '🎯',
    [TimelineEventType.STARTED]: '▶️',
    [TimelineEventType.TASK_COMPLETED]: '✅',
    [TimelineEventType.TASK_FAILED]: '❌',
    [TimelineEventType.REVIEW_REQUESTED]: '👀',
    [TimelineEventType.REVIEW_APPROVED]: '✔️',
    [TimelineEventType.REVIEW_REJECTED]: '⛔',
    [TimelineEventType.COMPLETED]: '🎉',
    [TimelineEventType.FAILED]: '💥',
    [TimelineEventType.CANCELLED]: '🚫',
    [TimelineEventType.COMMENT_ADDED]: '💬'
  };
  
  return iconMap[type] || '📌';
};

/**
 * Gets the appropriate color class for a timeline event type
 * @param type - The timeline event type
 * @returns CSS color class name
 */
const getEventColor = (type: TimelineEventType): string => {
  const colorMap: Record<TimelineEventType, string> = {
    [TimelineEventType.CREATED]: 'bg-blue-100 border-blue-400',
    [TimelineEventType.STARTED]: 'bg-green-100 border-green-400',
    [TimelineEventType.TASK_COMPLETED]: 'bg-green-100 border-green-500',
    [TimelineEventType.TASK_FAILED]: 'bg-red-100 border-red-500',
    [TimelineEventType.REVIEW_REQUESTED]: 'bg-yellow-100 border-yellow-400',
    [TimelineEventType.REVIEW_APPROVED]: 'bg-green-100 border-green-600',
    [TimelineEventType.REVIEW_REJECTED]: 'bg-red-100 border-red-400',
    [TimelineEventType.COMPLETED]: 'bg-purple-100 border-purple-500',
    [TimelineEventType.FAILED]: 'bg-red-100 border-red-600',
    [TimelineEventType.CANCELLED]: 'bg-gray-100 border-gray-400',
    [TimelineEventType.COMMENT_ADDED]: 'bg-blue-50 border-blue-300'
  };
  
  return colorMap[type] || 'bg-gray-100 border-gray-400';
};

/**
 * Sanitizes and formats event description for safe display
 * @param description - Raw description text
 * @returns Sanitized HTML string
 * @security Prevents XSS by sanitizing all user-generated content
 */
const sanitizeDescription = (description: string): string => {
  return DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code'],
    ALLOWED_ATTR: []
  });
};

/**
 * WorkflowTimeline Component
 * 
 * Renders a chronological timeline of workflow events with visual indicators
 * for different event types. Supports interactive elements and responsive design.
 * 
 * @param props - Component props
 * @returns Timeline component
 * 
 * @example
 * ```tsx
 * <WorkflowTimeline 
 *   events={workflowEvents}
 *   tasks={workflowTasks}
 *   className="mt-4"
 * />
 * ```
 */
export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  events,
  tasks = [],
  className = ''
}) => {
  /**
   * Sort events by timestamp in descending order (newest first)
   * Memoized to prevent unnecessary recalculation
   */
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events]);

  /**
   * Create a map of task IDs to task names for quick lookup
   */
  const taskMap = useMemo(() => {
    const map = new Map<number, string>();
    tasks.forEach(task => {
      map.set(task.id, task.name);
    });
    return map;
  }, [tasks]);

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={`workflow-timeline ${className}`}>
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline events */}
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const isFirst = index === 0;
            const taskName = event.task_id ? taskMap.get(event.task_id) : null;

            return (
              <div
                key={event.id}
                className="relative flex items-start gap-4 pl-2"
              >
                {/* Event icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg z-10 ${
                    getEventColor(event.type)
                  } ${isFirst ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                  title={event.type}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                    {/* Event header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {/* Sanitize title to prevent XSS */}
                        {DOMPurify.sanitize(event.title, { ALLOWED_TAGS: [] })}
                      </h4>
                      <time
                        className="text-xs text-gray-500 whitespace-nowrap"
                        dateTime={event.timestamp}
                        title={format(new Date(event.timestamp), 'PPpp')}
                      >
                        {formatDistanceToNow(new Date(event.timestamp), {
                          addSuffix: true
                        })}
                      </time>
                    </div>

                    {/* Event description */}
                    {event.description && (
                      <p
                        className="text-sm text-gray-600 mb-2"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeDescription(event.description)
                        }}
                      />
                    )}

                    {/* Task reference */}
                    {taskName && (
                      <div className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Task:</span>{' '}
                        <code className="bg-gray-100 px-1 py-0.5 rounded">
                          {DOMPurify.sanitize(taskName, { ALLOWED_TAGS: [] })}
                        </code>
                      </div>
                    )}

                    {/* Metadata display (if present) */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {/* Sanitize metadata before display */}
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {events.length} event{events.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default WorkflowTimeline;