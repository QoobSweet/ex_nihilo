/**
 * Workflow Data Formatter Utility
 *
 * Provides secure data transformation and formatting functions for workflow
 * visualizations, charts, and timeline components.
 *
 * @security All data is validated and sanitized before formatting
 * @module workflowDataFormatter
 */

import { format, parseISO, isValid, differenceInDays, differenceInHours } from 'date-fns';
import DOMPurify from 'dompurify';
import { z } from 'zod';

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
 * Schema for validating workflow data
 */
const WorkflowSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(WorkflowStatus),
  type: z.nativeEnum(WorkflowType),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable().optional(),
  user_id: z.number().int().positive(),
  task_count: z.number().int().min(0).optional(),
  completed_tasks: z.number().int().min(0).optional(),
  agent_executions: z.number().int().min(0).optional()
});

export type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * Schema for validating task data
 */
const TaskSchema = z.object({
  id: z.number().int().positive(),
  workflow_id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  status: z.string().min(1).max(50),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable().optional()
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Metrics data structure
 */
export interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  completionRate: number;
  averageDuration: number;
  totalTasks: number;
  completedTasks: number;
}

/**
 * Chart data point structure
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

/**
 * Timeline event structure
 */
export interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  timestamp: Date;
  type: 'created' | 'updated' | 'completed' | 'failed';
  workflowId: number;
}

/**
 * Trend data point for time-series charts
 */
export interface TrendDataPoint {
  date: string;
  completed: number;
  failed: number;
  inProgress: number;
}

/**
 * Validates an array of workflows
 *
 * @param workflows - Raw workflow data to validate
 * @returns Validated workflow array
 * @throws {z.ZodError} If validation fails
 * @security Validates all input data against strict schema
 */
export function validateWorkflows(workflows: unknown[]): Workflow[] {
  if (!Array.isArray(workflows)) {
    throw new Error('Workflows must be an array');
  }

  return workflows.map((workflow, index) => {
    try {
      return WorkflowSchema.parse(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid workflow at index ${index}: ${error.message}`);
      }
      throw error;
    }
  });
}

/**
 * Sanitizes a string for safe display in HTML
 *
 * @param input - String to sanitize
 * @returns Sanitized string safe for HTML rendering
 * @security Prevents XSS attacks by sanitizing all user-generated content
 */
export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

/**
 * Calculates comprehensive workflow metrics
 *
 * @param workflows - Array of validated workflows
 * @returns Calculated metrics object
 * @security All inputs must be pre-validated with validateWorkflows
 */
export function calculateMetrics(workflows: Workflow[]): WorkflowMetrics {
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(
    w => w.status === WorkflowStatus.IN_PROGRESS || w.status === WorkflowStatus.PENDING
  ).length;
  const completedWorkflows = workflows.filter(
    w => w.status === WorkflowStatus.COMPLETED
  ).length;
  const failedWorkflows = workflows.filter(
    w => w.status === WorkflowStatus.FAILED
  ).length;

  const completionRate = totalWorkflows > 0
    ? Math.round((completedWorkflows / totalWorkflows) * 100)
    : 0;

  // Calculate average duration for completed workflows
  const completedWithDuration = workflows.filter(
    w => w.status === WorkflowStatus.COMPLETED && w.completed_at
  );

  let averageDuration = 0;
  if (completedWithDuration.length > 0) {
    const totalDuration = completedWithDuration.reduce((sum, workflow) => {
      const created = parseISO(workflow.created_at);
      const completed = parseISO(workflow.completed_at!);
      if (isValid(created) && isValid(completed)) {
        return sum + differenceInHours(completed, created);
      }
      return sum;
    }, 0);
    averageDuration = Math.round(totalDuration / completedWithDuration.length);
  }

  // Calculate task statistics
  const totalTasks = workflows.reduce((sum, w) => sum + (w.task_count || 0), 0);
  const completedTasks = workflows.reduce((sum, w) => sum + (w.completed_tasks || 0), 0);

  return {
    totalWorkflows,
    activeWorkflows,
    completedWorkflows,
    failedWorkflows,
    completionRate,
    averageDuration,
    totalTasks,
    completedTasks
  };
}

/**
 * Formats workflow data for status distribution chart
 *
 * @param workflows - Array of validated workflows
 * @returns Array of chart data points
 * @security All inputs must be pre-validated with validateWorkflows
 */
export function formatStatusDistribution(workflows: Workflow[]): ChartDataPoint[] {
  const statusCounts = workflows.reduce((acc, workflow) => {
    acc[workflow.status] = (acc[workflow.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colorMap: Record<WorkflowStatus, string> = {
    [WorkflowStatus.PENDING]: '#FFA500',
    [WorkflowStatus.IN_PROGRESS]: '#4A90E2',
    [WorkflowStatus.COMPLETED]: '#4CAF50',
    [WorkflowStatus.FAILED]: '#F44336',
    [WorkflowStatus.CANCELLED]: '#9E9E9E'
  };

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count,
    color: colorMap[status as WorkflowStatus] || '#9E9E9E'
  }));
}

/**
 * Formats workflow data for type distribution chart
 *
 * @param workflows - Array of validated workflows
 * @returns Array of chart data points
 * @security All inputs must be pre-validated with validateWorkflows
 */
export function formatTypeDistribution(workflows: Workflow[]): ChartDataPoint[] {
  const typeCounts = workflows.reduce((acc, workflow) => {
    acc[workflow.type] = (acc[workflow.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colorMap: Record<WorkflowType, string> = {
    [WorkflowType.FEATURE]: '#2196F3',
    [WorkflowType.BUGFIX]: '#FF5722',
    [WorkflowType.REFACTOR]: '#9C27B0',
    [WorkflowType.DOCUMENTATION]: '#607D8B'
  };

  return Object.entries(typeCounts).map(([type, count]) => ({
    name: type.toUpperCase(),
    value: count,
    color: colorMap[type as WorkflowType] || '#9E9E9E'
  }));
}

/**
 * Formats workflow data for completion trend chart
 *
 * @param workflows - Array of validated workflows
 * @param days - Number of days to include in trend (default: 7)
 * @returns Array of trend data points
 * @security All inputs must be pre-validated with validateWorkflows
 */
export function formatCompletionTrend(
  workflows: Workflow[],
  days: number = 7
): TrendDataPoint[] {
  // Validate days parameter
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('Days must be an integer between 1 and 365');
  }

  const now = new Date();
  const trendData: TrendDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'MMM dd');

    const dayWorkflows = workflows.filter(w => {
      const updatedDate = parseISO(w.updated_at);
      return isValid(updatedDate) && differenceInDays(date, updatedDate) === 0;
    });

    trendData.push({
      date: dateStr,
      completed: dayWorkflows.filter(w => w.status === WorkflowStatus.COMPLETED).length,
      failed: dayWorkflows.filter(w => w.status === WorkflowStatus.FAILED).length,
      inProgress: dayWorkflows.filter(w => w.status === WorkflowStatus.IN_PROGRESS).length
    });
  }

  return trendData;
}

/**
 * Formats workflow data for timeline display
 *
 * @param workflows - Array of validated workflows
 * @param limit - Maximum number of events to return (default: 20)
 * @returns Array of timeline events sorted by timestamp (newest first)
 * @security All inputs must be pre-validated with validateWorkflows
 */
export function formatTimeline(
  workflows: Workflow[],
  limit: number = 20
): TimelineEvent[] {
  // Validate limit parameter
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be an integer between 1 and 100');
  }

  const events: TimelineEvent[] = [];

  workflows.forEach(workflow => {
    // Created event
    const createdDate = parseISO(workflow.created_at);
    if (isValid(createdDate)) {
      events.push({
        id: workflow.id * 1000, // Ensure unique ID
        title: sanitizeString(workflow.name),
        description: `Workflow created: ${sanitizeString(workflow.type)}`,
        timestamp: createdDate,
        type: 'created',
        workflowId: workflow.id
      });
    }

    // Completed event
    if (workflow.status === WorkflowStatus.COMPLETED && workflow.completed_at) {
      const completedDate = parseISO(workflow.completed_at);
      if (isValid(completedDate)) {
        events.push({
          id: workflow.id * 1000 + 1,
          title: sanitizeString(workflow.name),
          description: 'Workflow completed successfully',
          timestamp: completedDate,
          type: 'completed',
          workflowId: workflow.id
        });
      }
    }

    // Failed event
    if (workflow.status === WorkflowStatus.FAILED) {
      const updatedDate = parseISO(workflow.updated_at);
      if (isValid(updatedDate)) {
        events.push({
          id: workflow.id * 1000 + 2,
          title: sanitizeString(workflow.name),
          description: 'Workflow failed',
          timestamp: updatedDate,
          type: 'failed',
          workflowId: workflow.id
        });
      }
    }
  });

  // Sort by timestamp (newest first) and limit
  return events
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Formats a date for display
 *
 * @param dateString - ISO date string
 * @param formatString - Format pattern (default: 'MMM dd, yyyy HH:mm')
 * @returns Formatted date string or 'Invalid date' if parsing fails
 * @security Validates date before formatting
 */
export function formatDate(
  dateString: string,
  formatString: string = 'MMM dd, yyyy HH:mm'
): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, formatString);
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Calculates duration between two dates in human-readable format
 *
 * @param startDate - Start date ISO string
 * @param endDate - End date ISO string
 * @returns Human-readable duration string
 * @security Validates dates before calculation
 */
export function calculateDuration(startDate: string, endDate: string): string {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) {
      return 'N/A';
    }

    const hours = differenceInHours(end, start);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  } catch (error) {
    return 'N/A';
  }
}