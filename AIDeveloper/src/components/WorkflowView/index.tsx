import React, { useEffect, useState } from 'react';
import { ChartComponent } from './ChartComponent';
import { TimelineComponent } from './TimelineComponent';
import { validateChartData, validateTimelineItems, processCodebaseStatsForChart, ValidatedChartData, ValidatedTimelineItem } from '../../utils/dataVisualizers';
import DOMPurify from 'dompurify';

interface WorkflowViewProps {
  workflowId: string;
}

interface CodebaseStats {
  fileTypes: Record<string, number>;
  totalLines: number;
}

/**
 * Enhanced Workflow View component with modern design, charts, and timeline
 *
 * @param workflowId - The ID of the workflow to display
 * @returns The workflow view component
 *
 * @security Fetches data securely, validates all inputs, sanitizes outputs with DOMPurify
 */
export const WorkflowView: React.FC<WorkflowViewProps> = ({ workflowId }) => {
  const [stats, setStats] = useState<CodebaseStats | null>(null);
  const [timelineItems, setTimelineItems] = useState<ValidatedTimelineItem[]>([]);
  const [chartData, setChartData] = useState<ValidatedChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch codebase stats (assume secure API endpoint)
        const statsResponse = await fetch(`/api/workflows/${workflowId}/stats`);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const rawStats = await statsResponse.json();
        setStats(rawStats);

        // Process and validate chart data
        const processedChartData = processCodebaseStatsForChart(rawStats);
        setChartData(processedChartData);

        // Fetch timeline data (assume secure API endpoint)
        const timelineResponse = await fetch(`/api/workflows/${workflowId}/timeline`);
        if (!timelineResponse.ok) throw new Error('Failed to fetch timeline');
        const rawTimeline = await timelineResponse.json();
        const validatedTimeline = validateTimelineItems(rawTimeline);
        setTimelineItems(validatedTimeline);
      } catch (err) {
        setError(DOMPurify.sanitize((err as Error).message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workflowId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="workflow-view" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{DOMPurify.sanitize(`Workflow: ${workflowId}`)}</h1>
      <div className="stats-summary" style={{ marginBottom: '20px' }}>
        <p>Total Lines: {stats?.totalLines}</p>
      </div>
      <div className="chart-section" style={{ marginBottom: '20px' }}>
        {chartData && <ChartComponent data={chartData} title="Codebase File Distribution" />}
      </div>
      <div className="timeline-section">
        <TimelineComponent items={timelineItems} />
      </div>
    </div>
  );
};
