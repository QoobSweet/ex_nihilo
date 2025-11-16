import { WorkflowData, ChartDataPoint, TimelineEvent } from '../types/workflow'; // Assuming types are defined elsewhere

/**
 * Transforms raw workflow data into chart-friendly format for status distribution.
 *
 * @param workflows - Array of workflow objects
 * @returns Array of data points for chart rendering
 * @throws {Error} If workflows array is invalid
 *
 * @security No user input processing; assumes data from trusted API
 */
export function transformWorkflowsForStatusChart(workflows: WorkflowData[]): ChartDataPoint[] {
  if (!Array.isArray(workflows)) {
    throw new Error('Invalid workflows data: expected array');
  }

  const statusCounts: Record<string, number> = {};
  workflows.forEach(workflow => {
    const status = workflow.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));
}

/**
 * Transforms raw workflow data into timeline events.
 *
 * @param workflows - Array of workflow objects
 * @returns Array of timeline events sorted by date
 * @throws {Error} If workflows array is invalid or dates are malformed
 *
 * @security No user input processing; assumes data from trusted API
 */
export function transformWorkflowsForTimeline(workflows: WorkflowData[]): TimelineEvent[] {
  if (!Array.isArray(workflows)) {
    throw new Error('Invalid workflows data: expected array');
  }

  const events: TimelineEvent[] = [];
  workflows.forEach(workflow => {
    if (workflow.createdAt && workflow.updatedAt) {
      events.push({
        id: workflow.id,
        title: workflow.name,
        date: new Date(workflow.createdAt),
        description: `Status: ${workflow.status}`,
      });
      if (workflow.updatedAt !== workflow.createdAt) {
        events.push({
          id: `${workflow.id}-update`,
          title: `${workflow.name} Updated`,
          date: new Date(workflow.updatedAt),
          description: `Status: ${workflow.status}`,
        });
      }
    } else {
      throw new Error(`Invalid date for workflow ${workflow.id}`);
    }
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Transforms raw workflow data into progress chart data.
 *
 * @param workflows - Array of workflow objects
 * @returns Array of progress data points
 * @throws {Error} If workflows array is invalid
 *
 * @security No user input processing; assumes data from trusted API
 */
export function transformWorkflowsForProgressChart(workflows: WorkflowData[]): ChartDataPoint[] {
  if (!Array.isArray(workflows)) {
    throw new Error('Invalid workflows data: expected array');
  }

  return workflows.map(workflow => ({
    name: workflow.name,
    value: workflow.progress || 0,
  }));
}