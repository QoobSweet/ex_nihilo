import { z } from 'zod';

// Schema for validating workflow data
const WorkflowSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  status: z.enum(['pending', 'in-progress', 'completed']),
  progress: z.number().min(0).max(100),
});

type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * Processes workflow data for chart visualization.
 *
 * @param workflows - Array of workflow objects
 * @returns Object with counts for each status
 * @throws {ValidationError} If workflow data is invalid
 *
 * @security Validates input data to prevent malformed data injection
 */
export function processChartData(workflows: Workflow[]): { pending: number; inProgress: number; completed: number } {
  // Validate workflows
  workflows.forEach(w => {
    const result = WorkflowSchema.safeParse(w);
    if (!result.success) {
      throw new Error(`Invalid workflow data: ${result.error.message}`);
    }
  });

  const counts = { pending: 0, inProgress: 0, completed: 0 };
  workflows.forEach(workflow => {
    switch (workflow.status) {
      case 'pending':
        counts.pending++;
        break;
      case 'in-progress':
        counts.inProgress++;
        break;
      case 'completed':
        counts.completed++;
        break;
    }
  });
  return counts;
}

export type { Workflow };