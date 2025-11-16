/**
 * WorkflowCharts Component
 * 
 * Displays data visualizations for workflow metrics including:
 * - Task completion timeline (line chart)
 * - Task duration distribution (bar chart)
 * - Status distribution (pie chart)
 * 
 * @security All data is validated and sanitized before rendering
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { WorkflowChartData, WorkflowMetrics } from '../../types/workflow';

interface WorkflowChartsProps {
  chartData: WorkflowChartData;
  metrics: WorkflowMetrics;
  className?: string;
}

/**
 * Color palette for charts
 */
const COLORS = {
  completed: '#10b981', // green-500
  failed: '#ef4444',    // red-500
  pending: '#f59e0b',   // amber-500
  in_progress: '#3b82f6', // blue-500
  skipped: '#6b7280'    // gray-500
};

const PIE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#6b7280'  // gray
];

/**
 * Validates and sanitizes numeric values
 * 
 * @security Prevents injection of invalid numeric values
 */
function sanitizeNumber(value: unknown): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  return 0;
}

/**
 * Validates and sanitizes string values
 * 
 * @security Prevents XSS by limiting to alphanumeric and safe characters
 */
function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  // Allow only alphanumeric, spaces, hyphens, underscores, and common punctuation
  return value.replace(/[^a-zA-Z0-9\s\-_.,:()/]/g, '').slice(0, 100);
}

/**
 * Formats duration in milliseconds to human-readable format
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Custom tooltip for timeline chart
 */
const TimelineTooltip: React.FC<TooltipProps<number, string>> = ({ 
  active, 
  payload, 
  label 
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
      <p className="text-sm font-medium text-gray-900">
        {sanitizeString(label)}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {sanitizeString(entry.name)}: {sanitizeNumber(entry.value)}
        </p>
      ))}
    </div>
  );
};

/**
 * Custom tooltip for duration chart
 */
const DurationTooltip: React.FC<TooltipProps<number, string>> = ({ 
  active, 
  payload 
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
      <p className="text-sm font-medium text-gray-900">
        {sanitizeString(data.task_name)}
      </p>
      <p className="text-sm text-gray-600">
        Duration: {formatDuration(sanitizeNumber(data.duration_ms))}
      </p>
      <p className="text-sm text-gray-600">
        Status: {sanitizeString(data.status)}
      </p>
    </div>
  );
};

/**
 * Task Completion Timeline Chart
 */
const TaskCompletionChart: React.FC<{ data: WorkflowChartData['task_completion_timeline'] }> = ({ 
  data 
}) => {
  // Sanitize and validate data
  const sanitizedData = useMemo(() => {
    return data.map(point => ({
      timestamp: sanitizeString(point.timestamp),
      completed: sanitizeNumber(point.completed),
      failed: sanitizeNumber(point.failed),
      total: sanitizeNumber(point.total)
    }));
  }, [data]);

  if (sanitizedData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No completion data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Task Completion Timeline
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sanitizedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              try {
                return format(parseISO(value), 'HH:mm');
              } catch {
                return value;
              }
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<TimelineTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke={COLORS.completed} 
            strokeWidth={2}
            name="Completed"
          />
          <Line 
            type="monotone" 
            dataKey="failed" 
            stroke={COLORS.failed} 
            strokeWidth={2}
            name="Failed"
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke={COLORS.in_progress} 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Total"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Task Duration Distribution Chart
 */
const TaskDurationChart: React.FC<{ data: WorkflowChartData['task_duration_distribution'] }> = ({ 
  data 
}) => {
  // Sanitize and validate data
  const sanitizedData = useMemo(() => {
    return data.map(point => ({
      task_name: sanitizeString(point.task_name),
      duration_ms: sanitizeNumber(point.duration_ms),
      status: sanitizeString(point.status)
    })).slice(0, 10); // Limit to top 10 tasks for readability
  }, [data]);

  if (sanitizedData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No duration data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Task Duration Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sanitizedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="task_name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatDuration(value)}
          />
          <Tooltip content={<DurationTooltip />} />
          <Bar dataKey="duration_ms" name="Duration">
            {sanitizedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.status as keyof typeof COLORS] || COLORS.pending}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Status Distribution Pie Chart
 */
const StatusDistributionChart: React.FC<{ data: WorkflowChartData['status_distribution'] }> = ({ 
  data 
}) => {
  // Sanitize and validate data
  const sanitizedData = useMemo(() => {
    return data.map(point => ({
      status: sanitizeString(point.status),
      count: sanitizeNumber(point.count),
      percentage: sanitizeNumber(point.percentage)
    })).filter(point => point.count > 0);
  }, [data]);

  if (sanitizedData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No status data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Task Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sanitizedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.status}: ${entry.percentage.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {sanitizedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={PIE_COLORS[index % PIE_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Metrics Summary Card
 */
const MetricsSummary: React.FC<{ metrics: WorkflowMetrics }> = ({ metrics }) => {
  const successRate = sanitizeNumber(metrics.success_rate);
  const totalDuration = sanitizeNumber(metrics.total_duration_ms);
  const avgDuration = sanitizeNumber(metrics.average_task_duration_ms);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Workflow Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {sanitizeNumber(metrics.total_tasks)}
          </p>
          <p className="text-sm text-gray-600">Total Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {sanitizeNumber(metrics.completed_tasks)}
          </p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {sanitizeNumber(metrics.failed_tasks)}
          </p>
          <p className="text-sm text-gray-600">Failed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {successRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Success Rate</p>
        </div>
        {totalDuration > 0 && (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(totalDuration)}
              </p>
              <p className="text-sm text-gray-600">Total Duration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(avgDuration)}
              </p>
              <p className="text-sm text-gray-600">Avg Task Duration</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * WorkflowCharts Component
 * 
 * Main component that renders all workflow visualizations including
 * metrics summary, completion timeline, duration distribution, and status charts.
 * 
 * @param props - Component props
 * @param props.chartData - Chart data for visualizations
 * @param props.metrics - Workflow metrics for summary
 * @param props.className - Optional CSS class name
 * 
 * @security All data is validated and sanitized before rendering
 * @security Numeric values are checked for NaN and Infinity
 * @security String values are sanitized to prevent XSS
 */
export const WorkflowCharts: React.FC<WorkflowChartsProps> = ({ 
  chartData, 
  metrics, 
  className = '' 
}) => {
  return (
    <div className={`workflow-charts space-y-6 ${className}`}>
      <MetricsSummary metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskCompletionChart data={chartData.task_completion_timeline} />
        <StatusDistributionChart data={chartData.status_distribution} />
      </div>
      
      <TaskDurationChart data={chartData.task_duration_distribution} />
    </div>
  );
};

export default WorkflowCharts;