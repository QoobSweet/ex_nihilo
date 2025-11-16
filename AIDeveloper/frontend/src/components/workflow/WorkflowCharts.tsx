/**
 * WorkflowCharts Component
 * Displays data visualizations for workflow metrics and progress
 * 
 * @security All data is validated and sanitized before rendering
 * @security Chart data is type-checked to prevent injection attacks
 */

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { WorkflowMetrics, WorkflowTask, TaskStatus } from '../../types/workflow';
import { format } from 'date-fns';

interface WorkflowChartsProps {
  metrics: WorkflowMetrics;
  tasks: WorkflowTask[];
  className?: string;
}

/**
 * Color palette for charts
 * Using accessible colors with good contrast
 */
const CHART_COLORS = {
  completed: '#10b981', // green-500
  failed: '#ef4444',    // red-500
  pending: '#94a3b8',   // slate-400
  inProgress: '#3b82f6', // blue-500
  skipped: '#6b7280'    // gray-500
};

/**
 * Validates and sanitizes numeric values for charts
 * @param value - Value to validate
 * @param defaultValue - Default value if invalid
 * @returns Validated number
 * @security Prevents NaN and Infinity values that could break charts
 */
const sanitizeNumber = (value: number | null | undefined, defaultValue = 0): number => {
  if (value === null || value === undefined || !isFinite(value) || isNaN(value)) {
    return defaultValue;
  }
  return Math.max(0, value); // Ensure non-negative
};

/**
 * Formats duration in milliseconds to human-readable format
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
const formatDuration = (ms: number | null): string => {
  if (ms === null || ms === 0) return 'N/A';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

/**
 * Custom tooltip component for charts
 * @security Sanitizes all displayed values
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      {label && (
        <p className="font-semibold text-gray-900 mb-1">
          {String(label).substring(0, 100)} {/* Limit length */}
        </p>
      )}
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          <span className="font-medium">{String(entry.name).substring(0, 50)}:</span>{' '}
          {sanitizeNumber(entry.value)}
        </p>
      ))}
    </div>
  );
};

/**
 * WorkflowCharts Component
 * 
 * Renders multiple data visualizations for workflow metrics:
 * - Task distribution pie chart
 * - Progress bar chart
 * - Task duration comparison
 * - Velocity trend line (if applicable)
 * 
 * @param props - Component props
 * @returns Charts component
 * 
 * @example
 * ```tsx
 * <WorkflowCharts 
 *   metrics={workflowMetrics}
 *   tasks={workflowTasks}
 *   className="mt-6"
 * />
 * ```
 */
export const WorkflowCharts: React.FC<WorkflowChartsProps> = ({
  metrics,
  tasks,
  className = ''
}) => {
  /**
   * Prepare task distribution data for pie chart
   * Memoized to prevent unnecessary recalculation
   */
  const taskDistributionData = useMemo(() => {
    const data = [
      {
        name: 'Completed',
        value: sanitizeNumber(metrics.completed_tasks),
        color: CHART_COLORS.completed
      },
      {
        name: 'In Progress',
        value: sanitizeNumber(metrics.in_progress_tasks),
        color: CHART_COLORS.inProgress
      },
      {
        name: 'Pending',
        value: sanitizeNumber(metrics.pending_tasks),
        color: CHART_COLORS.pending
      },
      {
        name: 'Failed',
        value: sanitizeNumber(metrics.failed_tasks),
        color: CHART_COLORS.failed
      },
      {
        name: 'Skipped',
        value: sanitizeNumber(metrics.skipped_tasks),
        color: CHART_COLORS.skipped
      }
    ].filter(item => item.value > 0); // Only show non-zero values

    return data;
  }, [metrics]);

  /**
   * Prepare task duration data for bar chart
   * Only includes completed tasks with valid durations
   */
  const taskDurationData = useMemo(() => {
    return tasks
      .filter(task => 
        task.status === TaskStatus.COMPLETED && 
        task.duration_ms !== null &&
        task.duration_ms > 0
      )
      .map(task => ({
        name: task.name.substring(0, 30), // Truncate long names
        duration: sanitizeNumber(task.duration_ms) / 1000, // Convert to seconds
        durationMs: sanitizeNumber(task.duration_ms)
      }))
      .sort((a, b) => b.duration - a.duration) // Sort by duration descending
      .slice(0, 10); // Limit to top 10 tasks
  }, [tasks]);

  /**
   * Calculate progress percentage with validation
   */
  const progressPercentage = useMemo(() => {
    return sanitizeNumber(metrics.completion_percentage, 0);
  }, [metrics]);

  return (
    <div className={`workflow-charts space-y-6 ${className}`}>
      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Progress Overview
        </h3>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Completion
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Metrics summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {sanitizeNumber(metrics.total_tasks)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Total Tasks
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sanitizeNumber(metrics.completed_tasks)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sanitizeNumber(metrics.in_progress_tasks)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              In Progress
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatDuration(metrics.average_task_duration_ms)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Avg Duration
            </div>
          </div>
        </div>
      </div>

      {/* Task Distribution Pie Chart */}
      {taskDistributionData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Task Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Task Duration Bar Chart */}
      {taskDurationData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Task Duration Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDurationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                label={{ value: 'Duration (seconds)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value: number) => [
                  `${value.toFixed(2)}s`,
                  'Duration'
                ]}
              />
              <Bar dataKey="duration" fill={CHART_COLORS.inProgress} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty state */}
      {taskDistributionData.length === 0 && taskDurationData.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            No chart data available yet. Charts will appear as tasks are completed.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowCharts;