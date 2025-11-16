/**
 * WorkflowCharts Component
 *
 * Provides data visualization components for workflow analytics including
 * status distribution (pie chart), type distribution (donut chart), and
 * completion trends (line chart).
 *
 * @security All data is validated before rendering
 * @module WorkflowCharts
 */

import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import {
  ChartDataPoint,
  TrendDataPoint,
  formatStatusDistribution,
  formatTypeDistribution,
  formatCompletionTrend,
  Workflow
} from '../utils/workflowDataFormatter';

/**
 * Props for WorkflowCharts component
 */
interface WorkflowChartsProps {
  /** Array of validated workflows */
  workflows: Workflow[];
  /** Optional CSS class name */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Props for individual chart components
 */
interface ChartCardProps {
  /** Chart title */
  title: string;
  /** Chart subtitle/description */
  subtitle?: string;
  /** Chart content */
  children: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ChartCard Component
 *
 * Wrapper component for individual charts with consistent styling
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className
}) => {
  return (
    <div
      className={classNames(
        'bg-white rounded-lg border border-gray-200 p-6 shadow-sm',
        className
      )}
      role="article"
      aria-label={title}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

/**
 * Custom tooltip component for charts
 */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label
}) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        {label && (
          <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        )}
        {payload.map((entry, index) => (
          <p
            key={`tooltip-${index}`}
            className="text-sm text-gray-700"
            style={{ color: entry.color }}
          >
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * StatusDistributionChart Component
 *
 * Displays workflow status distribution as a pie chart
 */
const StatusDistributionChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name}: ${entry.value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * TypeDistributionChart Component
 *
 * Displays workflow type distribution as a donut chart
 */
const TypeDistributionChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name}: ${entry.value}`}
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * CompletionTrendChart Component
 *
 * Displays workflow completion trends over time as a line chart
 */
const CompletionTrendChart: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#666" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#4CAF50"
          strokeWidth={2}
          name="Completed"
          dot={{ fill: '#4CAF50', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="failed"
          stroke="#F44336"
          strokeWidth={2}
          name="Failed"
          dot={{ fill: '#F44336', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="inProgress"
          stroke="#4A90E2"
          strokeWidth={2}
          name="In Progress"
          dot={{ fill: '#4A90E2', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * WorkflowCharts Component
 *
 * Main component that renders all workflow visualization charts
 *
 * @example
 * ```tsx
 * const validatedWorkflows = validateWorkflows(rawWorkflows);
 * <WorkflowCharts workflows={validatedWorkflows} />
 * ```
 */
export const WorkflowCharts: React.FC<WorkflowChartsProps> = ({
  workflows,
  className,
  isLoading = false
}) => {
  // Memoize chart data to prevent unnecessary recalculations
  const statusData = useMemo(
    () => formatStatusDistribution(workflows),
    [workflows]
  );

  const typeData = useMemo(
    () => formatTypeDistribution(workflows),
    [workflows]
  );

  const trendData = useMemo(
    () => formatCompletionTrend(workflows, 7),
    [workflows]
  );

  if (isLoading) {
    return (
      <div
        className={classNames('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}
        role="status"
        aria-label="Loading charts"
      >
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={classNames('space-y-6', className)}
      role="region"
      aria-label="Workflow charts"
    >
      {/* Status Distribution */}
      <ChartCard
        title="Workflow Status Distribution"
        subtitle="Current status of all workflows"
      >
        <StatusDistributionChart data={statusData} />
      </ChartCard>

      {/* Type Distribution and Completion Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Workflow Type Distribution"
          subtitle="Breakdown by workflow type"
        >
          <TypeDistributionChart data={typeData} />
        </ChartCard>

        <ChartCard
          title="7-Day Completion Trend"
          subtitle="Workflow activity over the past week"
        >
          <CompletionTrendChart data={trendData} />
        </ChartCard>
      </div>
    </div>
  );
};

export default WorkflowCharts;