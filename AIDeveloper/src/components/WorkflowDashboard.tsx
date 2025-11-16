import React, { useEffect, useState } from 'react';
import { CodebaseStatsChart } from './Charts/CodebaseStatsChart';
import { WorkflowTimeline } from './Timeline/WorkflowTimeline';
import './../../styles/ModernWorkflow.css';

interface WorkflowDashboardProps {
  workflowId: string;
}

interface CodebaseStats {
  totalFiles: number;
  totalLines: number;
  languages: { [key: string]: number };
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
}

/**
 * Main dashboard component for displaying a modern, condensed workflow view
 * with charts and timeline.
 *
 * @param workflowId - The unique identifier for the workflow
 */
export const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({ workflowId }) => {
  const [stats, setStats] = useState<CodebaseStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch codebase stats
        const statsResponse = await fetch(`/api/workflows/${workflowId}/stats`);
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        const statsData: CodebaseStats = await statsResponse.json();
        setStats(statsData);

        // Fetch timeline events
        const timelineResponse = await fetch(`/api/workflows/${workflowId}/timeline`);
        if (!timelineResponse.ok) {
          throw new Error('Failed to fetch timeline');
        }
        const timelineData: TimelineEvent[] = await timelineResponse.json();
        setTimeline(timelineData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workflowId]);

  if (loading) {
    return <div className="loading">Loading workflow data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="workflow-dashboard">
      <h1>Workflow Dashboard</h1>
      <div className="dashboard-grid">
        <div className="chart-section">
          {stats && <CodebaseStatsChart stats={stats} />}
        </div>
        <div className="timeline-section">
          <WorkflowTimeline events={timeline} />
        </div>
      </div>
    </div>
  );
};
