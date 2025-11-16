import React from 'react';
import DOMPurify from 'dompurify';

/**
 * Metrics data structure for workflow performance indicators
 */
interface WorkflowMetricsData {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  failedTasks: number;
  estimatedTimeRemaining: number;
  actualTimeSpent: number;
  completionRate: number;
  averageTaskDuration: number;
}

/**
 * Props for the WorkflowMetrics component
 */
interface WorkflowMetricsProps {
  metrics: WorkflowMetricsData;
  className?: string;
}

/**
 * Formats duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 * @security Input is validated to be a number
 */
function formatDuration(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    return '0m';
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Formats a percentage value
 * @param value - Percentage value (0-100)
 * @returns Formatted percentage string
 * @security Input is validated and clamped to valid range
 */
function formatPercentage(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  const clamped = Math.max(0, Math.min(100, value));
  return `${clamped.toFixed(1)}%`;
}

/**
 * WorkflowMetrics Component
 * 
 * Displays a condensed metrics dashboard showing key performance indicators
 * for workflow execution including completion rate, active tasks, and time estimates.
 * 
 * @component
 * @param {WorkflowMetricsProps} props - Component props
 * @returns {JSX.Element} Rendered metrics dashboard
 * 
 * @security
 * - All numeric inputs are validated and sanitized
 * - No user-generated HTML content is rendered
 * - All text content is properly escaped by React
 * 
 * @example
 * ```tsx
 * <WorkflowMetrics
 *   metrics={{
 *     totalTasks: 10,
 *     completedTasks: 7,
 *     activeTasks: 2,
 *     failedTasks: 1,
 *     estimatedTimeRemaining: 300000,
 *     actualTimeSpent: 600000,
 *     completionRate: 70,
 *     averageTaskDuration: 85714
 *   }}
 * />
 * ```
 */
const WorkflowMetrics: React.FC<WorkflowMetricsProps> = ({ metrics, className = '' }) => {
  // Validate and sanitize all metrics data
  const safeMetrics: WorkflowMetricsData = {
    totalTasks: Math.max(0, Math.floor(metrics.totalTasks || 0)),
    completedTasks: Math.max(0, Math.floor(metrics.completedTasks || 0)),
    activeTasks: Math.max(0, Math.floor(metrics.activeTasks || 0)),
    failedTasks: Math.max(0, Math.floor(metrics.failedTasks || 0)),
    estimatedTimeRemaining: Math.max(0, metrics.estimatedTimeRemaining || 0),
    actualTimeSpent: Math.max(0, metrics.actualTimeSpent || 0),
    completionRate: Math.max(0, Math.min(100, metrics.completionRate || 0)),
    averageTaskDuration: Math.max(0, metrics.averageTaskDuration || 0)
  };

  /**
   * Metric card data structure
   */
  interface MetricCard {
    label: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }

  const metricCards: MetricCard[] = [
    {
      label: 'Completion Rate',
      value: formatPercentage(safeMetrics.completionRate),
      icon: '📊',
      color: 'primary',
      trend: safeMetrics.completionRate >= 70 ? 'up' : safeMetrics.completionRate >= 40 ? 'neutral' : 'down'
    },
    {
      label: 'Active Tasks',
      value: safeMetrics.activeTasks,
      icon: '⚡',
      color: 'info',
      trend: 'neutral'
    },
    {
      label: 'Completed',
      value: `${safeMetrics.completedTasks}/${safeMetrics.totalTasks}`,
      icon: '✓',
      color: 'success',
      trend: 'up'
    },
    {
      label: 'Failed Tasks',
      value: safeMetrics.failedTasks,
      icon: '✗',
      color: 'danger',
      trend: safeMetrics.failedTasks > 0 ? 'down' : 'neutral'
    },
    {
      label: 'Time Remaining',
      value: formatDuration(safeMetrics.estimatedTimeRemaining),
      icon: '⏱️',
      color: 'warning',
      trend: 'neutral'
    },
    {
      label: 'Time Spent',
      value: formatDuration(safeMetrics.actualTimeSpent),
      icon: '⏰',
      color: 'secondary',
      trend: 'neutral'
    },
    {
      label: 'Avg Task Duration',
      value: formatDuration(safeMetrics.averageTaskDuration),
      icon: '📈',
      color: 'info',
      trend: 'neutral'
    },
    {
      label: 'Total Tasks',
      value: safeMetrics.totalTasks,
      icon: '📋',
      color: 'secondary',
      trend: 'neutral'
    }
  ];

  return (
    <div className={`workflow-metrics ${className}`}>
      <div className="metrics-header">
        <h3 className="metrics-title">Workflow Metrics</h3>
        <div className="metrics-subtitle">Real-time performance indicators</div>
      </div>
      
      <div className="metrics-grid">
        {metricCards.map((card, index) => (
          <div 
            key={`metric-${index}-${card.label}`}
            className={`metric-card metric-card--${card.color}`}
            role="article"
            aria-label={`${card.label}: ${card.value}`}
          >
            <div className="metric-card__header">
              <span className="metric-card__icon" aria-hidden="true">
                {card.icon}
              </span>
              {card.trend && (
                <span 
                  className={`metric-card__trend metric-card__trend--${card.trend}`}
                  aria-label={`Trend: ${card.trend}`}
                >
                  {card.trend === 'up' && '↗'}
                  {card.trend === 'down' && '↘'}
                  {card.trend === 'neutral' && '→'}
                </span>
              )}
            </div>
            <div className="metric-card__body">
              <div className="metric-card__value">{card.value}</div>
              <div className="metric-card__label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar for overall completion */}
      <div className="metrics-progress">
        <div className="metrics-progress__header">
          <span className="metrics-progress__label">Overall Progress</span>
          <span className="metrics-progress__percentage">
            {formatPercentage(safeMetrics.completionRate)}
          </span>
        </div>
        <div className="metrics-progress__bar">
          <div 
            className="metrics-progress__fill"
            style={{ width: `${safeMetrics.completionRate}%` }}
            role="progressbar"
            aria-valuenow={safeMetrics.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Workflow completion: ${formatPercentage(safeMetrics.completionRate)}`}
          />
        </div>
        <div className="metrics-progress__details">
          <span className="metrics-progress__detail">
            {safeMetrics.completedTasks} completed
          </span>
          <span className="metrics-progress__detail">
            {safeMetrics.activeTasks} active
          </span>
          <span className="metrics-progress__detail">
            {safeMetrics.totalTasks - safeMetrics.completedTasks - safeMetrics.activeTasks} pending
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowMetrics;
export type { WorkflowMetricsData, WorkflowMetricsProps };