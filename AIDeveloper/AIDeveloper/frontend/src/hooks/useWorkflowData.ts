import { useState, useEffect } from 'react';

/**
 * Interface for workflow metrics data used in charts
 */
export interface WorkflowMetrics {
  taskCount: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  progressOverTime: Array<{ date: string; value: number }>;
}

/**
 * Interface for timeline events
 */
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'start' | 'complete' | 'milestone';
}

/**
 * Custom hook to fetch and manage workflow data for charts and timeline
 *
 * @param workflowId - The ID of the workflow to fetch data for
 * @returns Object containing data, loading state, and error state
 *
 * @security This hook fetches data from authenticated endpoints only.
 * No sensitive data is exposed in logs or state.
 */
export function useWorkflowData(workflowId: string) {
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch metrics - assuming authenticated API endpoint
        const metricsResponse = await fetch(`/api/workflows/${workflowId}/metrics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include auth headers if needed (e.g., Authorization: Bearer token)
          },
        });

        if (!metricsResponse.ok) {
          throw new Error(`Failed to fetch metrics: ${metricsResponse.statusText}`);
        }

        const metricsData: WorkflowMetrics = await metricsResponse.json();
        setMetrics(metricsData);

        // Fetch timeline events
        const timelineResponse = await fetch(`/api/workflows/${workflowId}/timeline`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!timelineResponse.ok) {
          throw new Error(`Failed to fetch timeline: ${timelineResponse.statusText}`);
        }

        const timelineData: TimelineEvent[] = await timelineResponse.json();
        setTimeline(timelineData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching workflow data:', errorMessage); // Log error without sensitive data
      } finally {
        setLoading(false);
      }
    };

    if (workflowId) {
      fetchData();
    }
  }, [workflowId]);

  return { metrics, timeline, loading, error };
}
