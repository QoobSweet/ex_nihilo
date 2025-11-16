import { z } from 'zod';

/**
 * Schema for validating workflow data
 */
const WorkflowDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  status: z.enum(['pending', 'in-progress', 'completed', 'failed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metrics: z.object({
    filesAnalyzed: z.number().int().min(0),
    linesOfCode: z.number().int().min(0),
    languages: z.record(z.string(), z.number().int().min(0)),
  }),
  timeline: z.array(z.object({
    event: z.string().min(1).max(200),
    timestamp: z.string().datetime(),
  })),
});

export type WorkflowData = z.infer<typeof WorkflowDataSchema>;

/**
 * Fetches and validates workflow data from the API
 * @param workflowId - The ID of the workflow to fetch
 * @returns Validated workflow data
 * @throws {ValidationError} If data is invalid
 * @throws {Error} If API call fails
 * @security Data is validated against schema to prevent injection attacks
 */
export async function fetchWorkflowData(workflowId: string): Promise<WorkflowData> {
  try {
    const response = await fetch(`/api/workflows/${encodeURIComponent(workflowId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow data: ${response.statusText}`);
    }

    const data = await response.json();
    return WorkflowDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid workflow data: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Aggregates metrics for chart visualization
 * @param workflowData - The validated workflow data
 * @returns Processed data for charts
 */
export function aggregateChartData(workflowData: WorkflowData) {
  const { metrics } = workflowData;
  return {
    filesAnalyzed: metrics.filesAnalyzed,
    linesOfCode: metrics.linesOfCode,
    languages: Object.entries(metrics.languages).map(([language, count]) => ({
      language,
      count,
    })),
  };
}

/**
 * Processes timeline data for component rendering
 * @param workflowData - The validated workflow data
 * @returns Sorted timeline events
 */
export function processTimelineData(workflowData: WorkflowData) {
  return workflowData.timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}