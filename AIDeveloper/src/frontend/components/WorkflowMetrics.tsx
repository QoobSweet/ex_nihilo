/**
 * WorkflowMetrics Component
 *
 * Displays key workflow statistics in a modern card-based layout.
 * Shows metrics like total workflows, completion rate, active workflows,
 * and average duration.
 *
 * @security All data is validated and sanitized before display
 * @module WorkflowMetrics
 */

import React from 'react';
import classNames from 'classnames';
import {
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiList
} from 'react-icons/fi';
import { WorkflowMetrics as MetricsData } from '../utils/workflowDataFormatter';

/**
 * Props for WorkflowMetrics component
 */
interface WorkflowMetricsProps {
  /** Calculated metrics data */
  metrics: MetricsData;
  /** Optional CSS class name */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Individual metric card props
 */
interface MetricCardProps {
  /** Card title */
  title: string;
  /** Metric value */
  value: string | number;
  /** Icon component */
  icon: React.ReactNode;
  /** Card color theme */
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  /** Optional subtitle */
  subtitle?: string;
}

/**
 * MetricCard Component
 *
 * Displays a single metric in a card format
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div
          className={classNames(
            'p-3 rounded-lg border',
            colorClasses[color]
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * WorkflowMetrics Component
 *
 * Displays comprehensive workflow metrics in a grid layout
 *
 * @example
 * ```tsx
 * const metrics = calculateMetrics(workflows);
 * <WorkflowMetrics metrics={metrics} />
 * ```
 */
export const WorkflowMetrics: React.FC<WorkflowMetricsProps> = ({
  metrics,
  className,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div
        className={classNames('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}
        role="status"
        aria-label="Loading metrics"
      >
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={classNames('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}
      role="region"
      aria-label="Workflow metrics"
    >
      <MetricCard
        title="Total Workflows"
        value={metrics.totalWorkflows}
        icon={<FiList size={24} />}
        color="blue"
        subtitle="All time"
      />

      <MetricCard
        title="Active Workflows"
        value={metrics.activeWorkflows}
        icon={<FiActivity size={24} />}
        color="orange"
        subtitle="In progress or pending"
      />

      <MetricCard
        title="Completed"
        value={metrics.completedWorkflows}
        icon={<FiCheckCircle size={24} />}
        color="green"
        subtitle="Successfully finished"
      />

      <MetricCard
        title="Completion Rate"
        value={`${metrics.completionRate}%`}
        icon={<FiTrendingUp size={24} />}
        color="purple"
        subtitle="Success percentage"
      />

      <MetricCard
        title="Average Duration"
        value={metrics.averageDuration > 0 ? `${metrics.averageDuration}h` : 'N/A'}
        icon={<FiClock size={24} />}
        color="gray"
        subtitle="Time to complete"
      />

      <MetricCard
        title="Failed Workflows"
        value={metrics.failedWorkflows}
        icon={<FiAlertCircle size={24} />}
        color="red"
        subtitle="Requires attention"
      />
    </div>
  );
};

export default WorkflowMetrics;