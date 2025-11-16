import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface WorkflowMetrics {
  statusDistribution: { name: string; value: number; color: string }[];
  progressOverTime: { date: string; completed: number; inProgress: number }[];
}

interface WorkflowChartProps {
  metrics: WorkflowMetrics;
}

/**
 * WorkflowChart component displays visual data representations of workflow metrics
 * using bar and pie charts for status distribution and progress tracking.
 *
 * @param metrics - The workflow metrics data including status distribution and progress over time
 * @returns JSX.Element - The rendered chart components
 *
 * @security This component renders sanitized data from props; no user input is directly inserted into HTML
 */
const WorkflowChart: React.FC<WorkflowChartProps> = ({ metrics }) => {
  return (
    <div className="workflow-charts" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="chart-container" style={{ flex: 1, minWidth: '300px' }}>
        <h3>Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={metrics.statusDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {metrics.statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-container" style={{ flex: 1, minWidth: '300px' }}>
        <h3>Progress Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.progressOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" stackId="a" fill="#82ca9d" />
            <Bar dataKey="inProgress" stackId="a" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkflowChart;
