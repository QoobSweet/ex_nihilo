/**
 * Workflow type definitions
 * Defines the structure for workflow data, metrics, timeline events, and visualizations
 */

/**
 * Workflow status enumeration
 */
export enum WorkflowStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
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
  CREATED = 'created',
  STARTED = 'started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  REVIEW_REQUESTED = 'review_requested',
  REVIEW_APPROVED = 'review_approved',
  REVIEW_REJECTED = 'review_rejected',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  COMMENT_ADDED = 'comment_added'
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
  order: number;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a timeline event in the workflow
 */
export interface TimelineEvent {
  id: number;
  workflow_id: number;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  user_id?: number;
  task_id?: number;
}

/**
 * Workflow metrics for data visualization
 */
export interface WorkflowMetrics {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  skipped_tasks: number;
  completion_percentage: number;
  total_duration_ms: number | null;
  average_task_duration_ms: number | null;
  estimated_completion_time: string | null;
}

/**
 * Data point for chart visualization
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

/**
 * Velocity data for trend analysis
 */
export interface VelocityDataPoint {
  timestamp: string;
  tasks_completed: number;
  cumulative_tasks: number;
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
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  tasks?: WorkflowTask[];
  timeline_events?: TimelineEvent[];
  metrics?: WorkflowMetrics;
}

/**
 * Workflow creation request
 */
export interface CreateWorkflowRequest {
  name: string;
  description: string;
  type: WorkflowType;
}

/**
 * Workflow update request
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
  limit: number;
}

/**
 * Workflow detail response
 */
export interface WorkflowDetailResponse {
  workflow: Workflow;
  tasks: WorkflowTask[];
  timeline_events: TimelineEvent[];
  metrics: WorkflowMetrics;
}