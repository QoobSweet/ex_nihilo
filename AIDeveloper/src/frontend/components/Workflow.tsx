import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { WorkflowMetrics } from './WorkflowMetrics';
import { WorkflowCharts } from './WorkflowCharts';
import { WorkflowTimeline } from './WorkflowTimeline';
import '../styles/workflow.css';

/**
 * Workflow data structure
 */
interface WorkflowData {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  type: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  tasks?: TaskData[];
  metrics?: MetricsData;
}

/**
 * Task data structure
 */
interface TaskData {
  id: number;
  workflow_id: number;
  type: string;
  status: string;
  agent_type: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * Metrics data structure
 */
interface MetricsData {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  totalDuration: number;
}

/**
 * Sanitizes text content to prevent XSS attacks
 * 
 * @param text - Raw text content
 * @returns Sanitized text safe for rendering
 * @security Prevents XSS by sanitizing all user-provided content
 */
function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Workflow Component
 * 
 * Displays a comprehensive view of a workflow including metrics, charts,
 * timeline, and task details. Fetches workflow data from the API and
 * provides real-time updates.
 * 
 * @component
 * @example
 * ```tsx
 * // Used in router with :id parameter
 * <Route path="/workflows/:id" element={<Workflow />} />
 * ```
 * 
 * @security
 * - All user-provided content is sanitized before rendering
 * - API requests include authentication headers
 * - Input validation on workflow ID parameter
 */
export const Workflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate workflow ID parameter
  const workflowId = useMemo(() => {
    if (!id) return null;
    const parsed = parseInt(id, 10);
    if (isNaN(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }, [id]);

  /**
   * Fetches workflow data from the API
   * 
   * @security Uses parameterized URL construction to prevent injection
   */
  useEffect(() => {
    if (!workflowId) {
      setError('Invalid workflow ID');
      setLoading(false);
      return;
    }

    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construct URL safely with validated ID
        const url = `/api/workflows/${workflowId}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Authentication header would be added by middleware
          },
          credentials: 'include' // Include cookies for session auth
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Workflow not found');
          }
          if (response.status === 403) {
            throw new Error('Access denied');
          }
          throw new Error(`Failed to fetch workflow: ${response.statusText}`);
        }

        const data = await response.json();
        setWorkflow(data);
      } catch (err) {
        console.error('Error fetching workflow:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();

    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(fetchWorkflow, 5000);

    return () => clearInterval(interval);
  }, [workflowId]);

  // Transform tasks into timeline events
  const timelineEvents = useMemo(() => {
    if (!workflow?.tasks) return [];

    return workflow.tasks.flatMap(task => {
      const events = [];
      
      // Task created event
      events.push({
        id: `task-${task.id}-created`,
        timestamp: task.created_at,
        type: 'task_created' as const,
        title: `${task.type} task created`,
        description: `Task assigned to ${task.agent_type} agent`,
        agent: task.agent_type
      });

      // Task completed/failed event
      if (task.completed_at) {
        events.push({
          id: `task-${task.id}-completed`,
          timestamp: task.completed_at,
          type: task.status === 'completed' ? 'task_completed' as const : 'task_failed' as const,
          title: `${task.type} task ${task.status}`,
          description: task.output ? 'Task completed successfully' : 'Task failed',
          agent: task.agent_type,
          metadata: task.output
        });
      }

      return events;
    });
  }, [workflow]);

  // Calculate metrics from workflow data
  const metrics = useMemo(() => {
    if (!workflow?.tasks) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageTaskDuration: 0
      };
    }

    const totalTasks = workflow.tasks.length;
    const completedTasks = workflow.tasks.filter(t => t.status === 'completed').length;
    const failedTasks = workflow.tasks.filter(t => t.status === 'failed').length;
    
    const durations = workflow.tasks
      .filter(t => t.completed_at)
      .map(t => {
        const start = new Date(t.created_at).getTime();
        const end = new Date(t.completed_at!).getTime();
        return end - start;
      });
    
    const averageTaskDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      averageTaskDuration: Math.round(averageTaskDuration / 1000) // Convert to seconds
    };
  }, [workflow]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!workflow?.tasks) return [];

    // Group tasks by status for pie chart
    const statusCounts = workflow.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [workflow]);

  if (loading) {
    return (
      <div className="workflow-view">
        <div className="workflow-loading">
          <div className="workflow-loading-spinner" />
          <p className="workflow-loading-text">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow-view">
        <div className="workflow-error">
          <h3 className="workflow-error-title">Error Loading Workflow</h3>
          <p className="workflow-error-message">{sanitizeText(error)}</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="workflow-view">
        <div className="workflow-error">
          <h3 className="workflow-error-title">Workflow Not Found</h3>
          <p className="workflow-error-message">The requested workflow could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-view">
      {/* Header */}
      <div className="workflow-header">
        <div>
          <h1>{sanitizeText(workflow.name)}</h1>
          {workflow.description && (
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              {sanitizeText(workflow.description)}
            </p>
          )}
        </div>
        <div className={`workflow-status ${workflow.status}`}>
          {workflow.status === 'completed' && <FiCheckCircle />}
          {workflow.status === 'in-progress' && <FiClock />}
          {workflow.status === 'failed' && <FiAlertCircle />}
          {workflow.status === 'pending' && <FiClock />}
          {workflow.status}
        </div>
      </div>

      {/* Metrics */}
      <WorkflowMetrics
        totalTasks={metrics.totalTasks}
        completedTasks={metrics.completedTasks}
        failedTasks={metrics.failedTasks}
        averageTaskDuration={metrics.averageTaskDuration}
      />

      {/* Charts */}
      <WorkflowCharts
        taskStatusData={chartData}
        tasks={workflow.tasks || []}
      />

      {/* Timeline */}
      <WorkflowTimeline events={timelineEvents} />
    </div>
  );
};

export default Workflow;