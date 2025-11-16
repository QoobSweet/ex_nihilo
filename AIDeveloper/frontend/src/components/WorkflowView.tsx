import React, { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import WorkflowTimeline from './workflow/WorkflowTimeline';
import WorkflowMetrics, { WorkflowMetricsData } from './workflow/WorkflowMetrics';
import '../styles/workflow-modern.css';

/**
 * Workflow status enumeration
 */
enum WorkflowStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Task status enumeration
 */
enum TaskStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Task data structure
 */
interface Task {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  duration?: number;
  agent_type?: string;
  error_message?: string;
}

/**
 * Workflow data structure
 */
interface Workflow {
  id: number;
  name: string;
  description: string;
  status: WorkflowStatus;
  type: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  tasks: Task[];
}

/**
 * Props for the WorkflowView component
 */
interface WorkflowViewProps {
  workflow: Workflow;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Sanitizes a string to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string
 * @security Prevents XSS by sanitizing all user-generated content
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Calculates workflow metrics from task data
 * @param tasks - Array of workflow tasks
 * @returns Calculated metrics data
 * @security All inputs are validated and sanitized
 */
function calculateMetrics(tasks: Task[]): WorkflowMetricsData {
  if (!Array.isArray(tasks)) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      failedTasks: 0,
      estimatedTimeRemaining: 0,
      actualTimeSpent: 0,
      completionRate: 0,
      averageTaskDuration: 0
    };
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const activeTasks = tasks.filter(t => t.status === TaskStatus.ACTIVE).length;
  const failedTasks = tasks.filter(t => t.status === TaskStatus.FAILED).length;

  // Calculate actual time spent on completed tasks
  const actualTimeSpent = tasks
    .filter(t => t.status === TaskStatus.COMPLETED && typeof t.duration === 'number')
    .reduce((sum, t) => sum + (t.duration || 0), 0);

  // Calculate average task duration from completed tasks
  const completedTasksWithDuration = tasks.filter(
    t => t.status === TaskStatus.COMPLETED && typeof t.duration === 'number'
  );
  const averageTaskDuration = completedTasksWithDuration.length > 0
    ? actualTimeSpent / completedTasksWithDuration.length
    : 0;

  // Estimate remaining time based on average duration and remaining tasks
  const remainingTasks = totalTasks - completedTasks - failedTasks;
  const estimatedTimeRemaining = averageTaskDuration > 0
    ? averageTaskDuration * remainingTasks
    : 0;

  // Calculate completion rate
  const completionRate = totalTasks > 0
    ? (completedTasks / totalTasks) * 100
    : 0;

  return {
    totalTasks,
    completedTasks,
    activeTasks,
    failedTasks,
    estimatedTimeRemaining,
    actualTimeSpent,
    completionRate,
    averageTaskDuration
  };
}

/**
 * Formats a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 * @security Input is validated before processing
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString || typeof dateString !== 'string') {
    return 'N/A';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * WorkflowView Component
 * 
 * Displays a modernized workflow view with metrics, timeline, and task details.
 * Implements a clean, condensed design with data visualizations.
 * 
 * @component
 * @param {WorkflowViewProps} props - Component props
 * @returns {JSX.Element} Rendered workflow view
 * 
 * @security
 * - All user-generated content is sanitized to prevent XSS
 * - Input validation on all data processing
 * - No sensitive data exposed in UI
 * - Proper error handling for invalid data
 * 
 * @example
 * ```tsx
 * <WorkflowView
 *   workflow={workflowData}
 *   onRefresh={() => fetchWorkflow()}
 * />
 * ```
 */
const WorkflowView: React.FC<WorkflowViewProps> = ({ 
  workflow, 
  onRefresh,
  className = '' 
}) => {
  // Validate workflow object
  if (!workflow || typeof workflow !== 'object') {
    return (
      <div className="workflow-modern__error">
        <p>Invalid workflow data</p>
      </div>
    );
  }

  // Sanitize workflow data
  const safeWorkflow = {
    ...workflow,
    name: sanitizeString(workflow.name || 'Untitled Workflow'),
    description: sanitizeString(workflow.description || ''),
    type: sanitizeString(workflow.type || 'unknown'),
    tasks: Array.isArray(workflow.tasks) ? workflow.tasks.map(task => ({
      ...task,
      name: sanitizeString(task.name || 'Untitled Task'),
      description: sanitizeString(task.description || ''),
      agent_type: sanitizeString(task.agent_type || 'unknown'),
      error_message: task.error_message ? sanitizeString(task.error_message) : undefined
    })) : []
  };

  // Calculate metrics using memoization for performance
  const metrics = useMemo(
    () => calculateMetrics(safeWorkflow.tasks),
    [safeWorkflow.tasks]
  );

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !onRefresh) {
      return;
    }

    const interval = setInterval(() => {
      onRefresh();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  /**
   * Gets the appropriate CSS class for workflow status
   * @param status - Workflow status
   * @returns CSS class name
   */
  const getStatusClass = (status: WorkflowStatus): string => {
    const validStatuses = Object.values(WorkflowStatus);
    if (!validStatuses.includes(status)) {
      return 'workflow-modern__status--pending';
    }
    return `workflow-modern__status--${status}`;
  };

  /**
   * Gets the status icon for workflow status
   * @param status - Workflow status
   * @returns Status icon emoji
   */
  const getStatusIcon = (status: WorkflowStatus): string => {
    switch (status) {
      case WorkflowStatus.PENDING:
        return '⏳';
      case WorkflowStatus.ACTIVE:
        return '⚡';
      case WorkflowStatus.COMPLETED:
        return '✓';
      case WorkflowStatus.FAILED:
        return '✗';
      default:
        return '❓';
    }
  };

  return (
    <div className={`workflow-modern ${className}`}>
      {/* Workflow Header */}
      <div className="workflow-modern__header">
        <div>
          <h1 className="workflow-modern__title">
            <span aria-hidden="true">{getStatusIcon(safeWorkflow.status)}</span>
            {safeWorkflow.name}
          </h1>
          {safeWorkflow.description && (
            <p className="workflow-modern__description">
              {safeWorkflow.description}
            </p>
          )}
          <div className="workflow-modern__meta">
            <span>Type: {safeWorkflow.type}</span>
            <span>•</span>
            <span>Created: {formatDate(safeWorkflow.created_at)}</span>
            {safeWorkflow.started_at && (
              <>
                <span>•</span>
                <span>Started: {formatDate(safeWorkflow.started_at)}</span>
              </>
            )}
            {safeWorkflow.completed_at && (
              <>
                <span>•</span>
                <span>Completed: {formatDate(safeWorkflow.completed_at)}</span>
              </>
            )}
          </div>
        </div>
        <div className="workflow-modern__actions">
          <span className={`workflow-modern__status ${getStatusClass(safeWorkflow.status)}`}>
            {safeWorkflow.status}
          </span>
          {onRefresh && (
            <div className="workflow-modern__refresh">
              <button
                onClick={onRefresh}
                className="btn btn--secondary"
                aria-label="Refresh workflow data"
              >
                🔄 Refresh
              </button>
              <label className="workflow-modern__auto-refresh">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  aria-label="Enable auto-refresh"
                />
                Auto-refresh
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Metrics */}
      <WorkflowMetrics metrics={metrics} />

      {/* Workflow Timeline */}
      <WorkflowTimeline tasks={safeWorkflow.tasks} />

      {/* Task Details Section */}
      <div className="workflow-tasks">
        <div className="workflow-tasks__header">
          <h3 className="workflow-tasks__title">Task Details</h3>
          <div className="workflow-tasks__summary">
            {metrics.totalTasks} total tasks
          </div>
        </div>
        <div className="workflow-tasks__list">
          {safeWorkflow.tasks.length === 0 ? (
            <div className="workflow-tasks__empty">
              <p>No tasks found for this workflow</p>
            </div>
          ) : (
            safeWorkflow.tasks.map((task) => (
              <div
                key={`task-${task.id}`}
                className={`workflow-task workflow-task--${task.status}`}
              >
                <div className="workflow-task__header">
                  <h4 className="workflow-task__title">{task.name}</h4>
                  <span className="workflow-task__status">{task.status}</span>
                </div>
                {task.description && (
                  <p className="workflow-task__description">{task.description}</p>
                )}
                <div className="workflow-task__meta">
                  {task.agent_type && (
                    <span className="workflow-task__meta-item">
                      Agent: {task.agent_type}
                    </span>
                  )}
                  {task.duration && (
                    <span className="workflow-task__meta-item">
                      Duration: {(task.duration / 1000).toFixed(2)}s
                    </span>
                  )}
                  <span className="workflow-task__meta-item">
                    Updated: {formatDate(task.updated_at)}
                  </span>
                </div>
                {task.error_message && (
                  <div className="workflow-task__error">
                    <strong>Error:</strong> {task.error_message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowView;
export type { Workflow, Task, WorkflowViewProps };
export { WorkflowStatus, TaskStatus };