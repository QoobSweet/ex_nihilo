import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { WorkflowMetrics } from '../hooks/useWorkflowData';

/**
 * Props for WorkflowChart component
 */
interface WorkflowChartProps {
  metrics: WorkflowMetrics | null;
  loading: boolean;
}

/**
 * Component to display workflow metrics using charts
 *
 * @param metrics - The workflow metrics data
 * @param loading - Loading state indicator
 *
 * @security Uses Recharts library for safe rendering; no user input directly rendered.
 */
export const WorkflowChart: React.FC<WorkflowChartProps> = ({ metrics, loading }) => {
  if (loading) {
    return <div>Loading charts...</div>;
  }

  if (!metrics) {
    return <div>No data available</div>;
  }

  // Prepare data for bar chart (task counts)
  const barData = [
    { name: 'Completed', value: metrics.completedTasks },
    { name: 'In Progress', value: metrics.inProgressTasks },
    { name: 'Pending', value: metrics.pendingTasks },
  ];

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3>Task Distribution</h3>
      <ResponsiveContainer width="100%" height="50%">
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Progress Over Time</h3>
      <ResponsiveContainer width="100%" height="50%">
        <LineChart data={metrics.progressOverTime}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
