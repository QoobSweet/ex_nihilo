/**
 * Workflow type definitions
 * Includes types for workflow data, metrics, timeline events, and chart data
 */

/**
 * Workflow status enumeration
 */
export enum WorkflowStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Workflow type enumeration
 */
export enum WorkflowType {
  FEATURE = 'feature',
  BUGFIX = 'bugfix',
  REFACTOR = 'refactor',
  DOCUMENTATION = 'documentation'
}

/**
 * Task status enumeration
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

/**
 * Timeline event type enumeration
 */
export enum TimelineEventType {
  WORKFLOW_CREATED = 'workflow_created',
  WORKFLOW_STARTED = 'workflow_started',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  REVIEW_REQUESTED = 'review_requested',
  REVIEW_COMPLETED = 'review_completed',
  WORKFLOW_COMPLETED = 'workflow_completed',
  WORKFLOW_FAILED = 'workflow_failed',
  WORKFLOW_CANCELLED = 'workflow_cancelled'
}

/**
 * Represents a task within a workflow
 */
export interface WorkflowTask {
  id: number;
  workflow_id: number;
  name: string;
  description: string;
  status: TaskStatus;
  agent_type: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a timeline event in workflow execution
 */
export interface TimelineEvent {
  id: number;
  workflow_id: number;
  task_id: number | null;
  event_type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

/**
 * Workflow execution metrics
 */
export interface WorkflowMetrics {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  skipped_tasks: number;
  total_duration_ms: number | null;
  average_task_duration_ms: number | null;
  success_rate: number;
  estimated_completion_time: string | null;
}

/**
 * Chart data point for task completion over time
 */
export interface TaskCompletionDataPoint {
  timestamp: string;
  completed: number;
  failed: number;
  total: number;
}

/**
 * Chart data point for task duration distribution
 */
export interface TaskDurationDataPoint {
  task_name: string;
  duration_ms: number;
  status: TaskStatus;
}

/**
 * Chart data point for status distribution
 */
export interface StatusDistributionDataPoint {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Aggregated chart data for workflow visualization
 */
export interface WorkflowChartData {
  task_completion_timeline: TaskCompletionDataPoint[];
  task_duration_distribution: TaskDurationDataPoint[];
  status_distribution: StatusDistributionDataPoint[];
}

/**
 * Main workflow interface
 */
export interface Workflow {
  id: number;
  user_id: number;
  name: string;
  description: string;
  type: WorkflowType;
  status: WorkflowStatus;
  repository_url: string | null;
  branch_name: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  tasks?: WorkflowTask[];
  timeline_events?: TimelineEvent[];
  metrics?: WorkflowMetrics;
  chart_data?: WorkflowChartData;
}

/**
 * Workflow creation request payload
 */
export interface CreateWorkflowRequest {
  name: string;
  description: string;
  type: WorkflowType;
  repository_url?: string;
}

/**
 * Workflow update request payload
 */
export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
}

/**
 * Workflow list response
 */
export interface WorkflowListResponse {
  workflows: Workflow[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Workflow detail response
 */
export interface WorkflowDetailResponse {
  workflow: Workflow;
}

/**
 * Type guard to check if a value is a valid WorkflowStatus
 */
export function isWorkflowStatus(value: unknown): value is WorkflowStatus {
  return Object.values(WorkflowStatus).includes(value as WorkflowStatus);
}

/**
 * Type guard to check if a value is a valid WorkflowType
 */
export function isWorkflowType(value: unknown): value is WorkflowType {
  return Object.values(WorkflowType).includes(value as WorkflowType);
}

/**
 * Type guard to check if a value is a valid TaskStatus
 */
export function isTaskStatus(value: unknown): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}