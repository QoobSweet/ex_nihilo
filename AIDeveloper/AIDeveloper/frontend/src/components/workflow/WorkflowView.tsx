import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import WorkflowTimeline, { TimelineEvent } from './WorkflowTimeline';
import WorkflowCharts, { WorkflowChartsData } from './WorkflowCharts';
import WorkflowMetrics, { WorkflowMetricsData } from './WorkflowMetrics';
import '../../styles/workflow-modern.css';

/**
 * Workflow status enum
 */
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Task status enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Task data structure
 */
export interface Task {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  agent: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  error?: string;
}

/**
 * Workflow data structure
 */
export interface Workflow {
  id: number;
  name: string;
  description: string;
  status: WorkflowStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  tasks: Task[];
  metadata?: Record<string, unknown>;
}

/**
 * Props for WorkflowView component
 */
interface WorkflowViewProps {
  workflow: Workflow;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Sanitizes string input to prevent XSS
 * @param input - String to sanitize
 * @returns Sanitized string
 * @security Prevents XSS attacks by sanitizing all string inputs
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Validates and sanitizes workflow data
 * @param workflow - Workflow data to validate
 * @returns Sanitized workflow data
 * @security Validates all inputs to prevent injection attacks and data corruption
 */
function validateWorkflow(workflow: Workflow): Workflow {
  return {
    id: Math.max(0, Math.floor(workflow.id || 0)),
    name: sanitizeString(workflow.name || 'Untitled Workflow'),
    description: sanitizeString(workflow.description || ''),
    status: Object.values(WorkflowStatus).includes(workflow.status)
      ? workflow.status
      : WorkflowStatus.PENDING,
    createdAt: workflow.createdAt || new Date().toISOString(),
    startedAt: workflow.startedAt,
    completedAt: workflow.completedAt,
    tasks: (workflow.tasks || []).map(validateTask),
    metadata: workflow.metadata || {}
  };
}

/**
 * Validates and sanitizes task data
 * @param task - Task data to validate
 * @returns Sanitized task data
 * @security Validates all inputs to prevent injection attacks
 */
function validateTask(task: Task): Task {
  return {
    id: Math.max(0, Math.floor(task.id || 0)),
    name: sanitizeString(task.name || 'Untitled Task'),
    description: sanitizeString(task.description || ''),
    status: Object.values(TaskStatus).includes(task.status)
      ? task.status
      : TaskStatus.PENDING,
    agent: sanitizeString(task.agent || 'Unknown'),
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    duration: task.duration ? Math.max(0, Math.floor(task.duration)) : undefined,
    error: task.error ? sanitizeString(task.error) : undefined
  };
}

/**
 * Converts workflow tasks to timeline events
 * @param tasks - Array of tasks
 * @returns Array of timeline events
 */
function tasksToTimelineEvents(tasks: Task[]): TimelineEvent[] {
  return tasks.map((task) => ({
    id: task.id.toString(),
    title: task.name,
    description: task.description,
    timestamp: task.startedAt || task.completedAt || new Date().toISOString(),
    status: task.status,
    agent: task.agent,
    duration: task.duration,
    error: task.error
  }));
}

/**
 * Calculates workflow metrics from tasks
 * @param tasks - Array of tasks
 * @returns Workflow metrics data
 */
function calculateMetrics(tasks: Task[]): WorkflowMetricsData {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const failedTasks = tasks.filter((t) => t.status === TaskStatus.FAILED).length;
  const pendingTasks = tasks.filter(
    (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.RUNNING
  ).length;

  // Calculate average duration (only for completed tasks)
  const completedWithDuration = tasks.filter(
    (t) => t.status === TaskStatus.COMPLETED && t.duration !== undefined
  );
  const averageDuration =
    completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, t) => sum + (t.duration || 0), 0) /
        completedWithDuration.length
      : 0;

  // Calculate total duration
  const totalDuration = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

  // Calculate success rate
  const successRate =
    completedTasks + failedTasks > 0
      ? Math.round((completedTasks / (completedTasks + failedTasks)) * 100)
      : 0;

  // Count active agents
  const activeAgents = new Set(
    tasks.filter((t) => t.status === TaskStatus.RUNNING).map((t) => t.agent)
  ).size;

  return {
    totalTasks,
    completedTasks,
    failedTasks,
    pendingTasks,
    averageDuration,
    successRate,
    totalDuration,
    activeAgents
  };
}

/**
 * Prepares chart data from workflow tasks
 * @param tasks - Array of tasks
 * @returns Chart data
 */
function prepareChartData(tasks: Task[]): WorkflowChartsData {
  // Task status distribution
  const statusCounts = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const taskStatusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  // Agent distribution
  const agentCounts = tasks.reduce(
    (acc, task) => {
      acc[task.agent] = (acc[task.agent] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const agentDistributionData = Object.entries(agentCounts).map(([agent, count]) => ({
    name: agent,
    value: count
  }));

  // Duration over time (for completed tasks)
  const durationData = tasks
    .filter((t) => t.status === TaskStatus.COMPLETED && t.completedAt && t.duration)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt!).getTime();
      const dateB = new Date(b.completedAt!).getTime();
      return dateA - dateB;
    })
    .map((task) => ({
      name: task.name,
      duration: Math.round((task.duration || 0) / 1000), // Convert to seconds
      timestamp: task.completedAt!
    }));

  return {
    taskStatusData,
    agentDistributionData,
    durationData
  };
}

/**
 * WorkflowView component - displays a comprehensive view of a workflow
 * with metrics, timeline, and charts
 *
 * @param props - Component props
 * @returns React component displaying workflow details
 *
 * @security
 * - All workflow data is validated and sanitized to prevent XSS
 * - Numeric values are validated to prevent NaN/Infinity issues
 * - Enum values are validated against allowed values
 * - All string inputs are sanitized using DOMPurify
 *
 * @example
 * ```tsx
 * const workflow: Workflow = {
 *   id: 1,
 *   name: 'Feature Implementation',
 *   description: 'Add user authentication',
 *   status: WorkflowStatus.RUNNING,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   tasks: [...]
 * };
 *
 * <WorkflowView workflow={workflow} onRefresh={handleRefresh} />
 * ```
 */
export const WorkflowView: React.FC<WorkflowViewProps> = ({
  workflow,
  onRefresh,
  className = ''
}) => {
  // Validate and sanitize workflow data
  const safeWorkflow = useMemo(() => validateWorkflow(workflow), [workflow]);

  // Calculate metrics
  const metrics = useMemo(() => calculateMetrics(safeWorkflow.tasks), [safeWorkflow.tasks]);

  // Prepare timeline events
  const timelineEvents = useMemo(
    () => tasksToTimelineEvents(safeWorkflow.tasks),
    [safeWorkflow.tasks]
  );

  // Prepare chart data
  const chartData = useMemo(() => prepareChartData(safeWorkflow.tasks), [safeWorkflow.tasks]);

  const sanitizedClassName = sanitizeString(className);

  return (
    <div className={`workflow-modern ${sanitizedClassName}`.trim()}>
      <div className="workflow-modern__container">
        {/* Header */}
        <header className="workflow-modern__header">
          <h1 className="workflow-modern__title">{safeWorkflow.name}</h1>
          {safeWorkflow.description && (
            <p className="workflow-modern__subtitle">{safeWorkflow.description}</p>
          )}
        </header>

        {/* Metrics Section */}
        <section aria-label="Workflow Metrics">
          <WorkflowMetrics metrics={metrics} />
        </section>

        {/* Charts Section */}
        <section aria-label="Workflow Charts">
          <WorkflowCharts data={chartData} />
        </section>

        {/* Timeline Section */}
        <section aria-label="Workflow Timeline">
          <WorkflowTimeline events={timelineEvents} />
        </section>

        {/* Refresh Button */}
        {onRefresh && (
          <div style={{ marginTop: 'var(--wf-spacing-xl)', textAlign: 'center' }}>
            <button
              onClick={onRefresh}
              className="workflow-refresh-button"
              type="button"
              aria-label="Refresh workflow data"
            >
              Refresh Workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowView;
