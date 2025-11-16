import React from 'react';
import DOMPurify from 'dompurify';

/**
 * Metrics data structure for workflow KPIs
 */
export interface WorkflowMetricsData {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
  averageDuration: number; // in milliseconds
  successRate: number; // percentage 0-100
  totalDuration: number; // in milliseconds
  activeAgents: number;
}

/**
 * Props for WorkflowMetrics component
 */
interface WorkflowMetricsProps {
  metrics: WorkflowMetricsData;
  className?: string;
}

/**
 * Individual metric card component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

/**
 * Formats duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 * @security Input is validated to be a number
 */
function formatDuration(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    return '0s';
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Formats a number with thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 * @security Input is validated to be a number
 */
function formatNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString('en-US');
}

/**
 * Sanitizes and validates string input for display
 * @param input - String to sanitize
 * @returns Sanitized string safe for display
 * @security Prevents XSS by sanitizing all string inputs
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * MetricCard component - displays a single metric with styling
 * @security All string inputs are sanitized to prevent XSS
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'primary'
}) => {
  const sanitizedTitle = sanitizeString(title);
  const sanitizedSubtitle = subtitle ? sanitizeString(subtitle) : '';
  const sanitizedIcon = icon ? sanitizeString(icon) : '';
  const sanitizedTrendValue = trendValue ? sanitizeString(trendValue) : '';
  const sanitizedValue = typeof value === 'string' ? sanitizeString(value) : value;

  return (
    <div className={`metric-card metric-card--${variant}`}>
      <div className="metric-card__header">
        {sanitizedIcon && (
          <span className="metric-card__icon" aria-hidden="true">
            {sanitizedIcon}
          </span>
        )}
        <h3 className="metric-card__title">{sanitizedTitle}</h3>
      </div>
      <div className="metric-card__body">
        <div className="metric-card__value">{sanitizedValue}</div>
        {sanitizedSubtitle && (
          <div className="metric-card__subtitle">{sanitizedSubtitle}</div>
        )}
      </div>
      {trend && sanitizedTrendValue && (
        <div className={`metric-card__trend metric-card__trend--${trend}`}>
          <span className="metric-card__trend-icon">
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
          <span className="metric-card__trend-value">{sanitizedTrendValue}</span>
        </div>
      )}
    </div>
  );
};

/**
 * WorkflowMetrics component - displays key performance indicators for a workflow
 *
 * @param props - Component props
 * @returns React component displaying workflow metrics
 *
 * @security
 * - All numeric inputs are validated to prevent NaN/Infinity issues
 * - All string inputs are sanitized to prevent XSS attacks
 * - Percentage calculations are bounded to 0-100 range
 *
 * @example
 * ```tsx
 * const metrics: WorkflowMetricsData = {
 *   totalTasks: 42,
 *   completedTasks: 38,
 *   failedTasks: 2,
 *   pendingTasks: 2,
 *   averageDuration: 125000,
 *   successRate: 95,
 *   totalDuration: 5250000,
 *   activeAgents: 3
 * };
 *
 * <WorkflowMetrics metrics={metrics} />
 * ```
 */
export const WorkflowMetrics: React.FC<WorkflowMetricsProps> = ({
  metrics,
  className = ''
}) => {
  // Validate and sanitize metrics data
  const safeMetrics: WorkflowMetricsData = {
    totalTasks: Math.max(0, Math.floor(metrics.totalTasks || 0)),
    completedTasks: Math.max(0, Math.floor(metrics.completedTasks || 0)),
    failedTasks: Math.max(0, Math.floor(metrics.failedTasks || 0)),
    pendingTasks: Math.max(0, Math.floor(metrics.pendingTasks || 0)),
    averageDuration: Math.max(0, Math.floor(metrics.averageDuration || 0)),
    successRate: Math.min(100, Math.max(0, Math.floor(metrics.successRate || 0))),
    totalDuration: Math.max(0, Math.floor(metrics.totalDuration || 0)),
    activeAgents: Math.max(0, Math.floor(metrics.activeAgents || 0))
  };

  // Calculate completion percentage
  const completionPercentage =
    safeMetrics.totalTasks > 0
      ? Math.round((safeMetrics.completedTasks / safeMetrics.totalTasks) * 100)
      : 0;

  // Determine variant based on success rate
  const getSuccessRateVariant = (rate: number): MetricCardProps['variant'] => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'danger';
  };

  const sanitizedClassName = sanitizeString(className);

  return (
    <div className={`workflow-metrics ${sanitizedClassName}`.trim()}>
      <div className="workflow-metrics__grid">
        <MetricCard
          title="Total Tasks"
          value={formatNumber(safeMetrics.totalTasks)}
          subtitle={`${safeMetrics.pendingTasks} pending`}
          icon="📋"
          variant="primary"
        />

        <MetricCard
          title="Completion Rate"
          value={`${completionPercentage}%`}
          subtitle={`${safeMetrics.completedTasks} of ${safeMetrics.totalTasks} completed`}
          icon="✓"
          variant={completionPercentage >= 80 ? 'success' : 'warning'}
        />

        <MetricCard
          title="Success Rate"
          value={`${safeMetrics.successRate}%`}
          subtitle={`${safeMetrics.failedTasks} failed tasks`}
          icon="🎯"
          variant={getSuccessRateVariant(safeMetrics.successRate)}
        />

        <MetricCard
          title="Avg Duration"
          value={formatDuration(safeMetrics.averageDuration)}
          subtitle="per task"
          icon="⏱️"
          variant="info"
        />

        <MetricCard
          title="Total Duration"
          value={formatDuration(safeMetrics.totalDuration)}
          subtitle="workflow runtime"
          icon="⏰"
          variant="info"
        />

        <MetricCard
          title="Active Agents"
          value={formatNumber(safeMetrics.activeAgents)}
          subtitle="currently running"
          icon="🤖"
          variant="primary"
        />
      </div>
    </div>
  );
};

export default WorkflowMetrics;
