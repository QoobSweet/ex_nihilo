import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { aggregateChartData, WorkflowData } from '../data/workflowData';

interface WorkflowChartProps {
  workflowData: WorkflowData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Component for displaying workflow metrics as charts
 * @param workflowData - The workflow data to visualize
 * @returns React component with bar and pie charts
 * @security Data is sanitized through schema validation in workflowData
 */
const WorkflowChart: React.FC<WorkflowChartProps> = ({ workflowData }) => {
  const chartData = aggregateChartData(workflowData);

  // Sanitize data for display (prevent XSS)
  const sanitizedLanguages = chartData.languages.map(item => ({
    ...item,
    language: item.language.replace(/[<>]/g, ''), // Basic sanitization
  }));

  return (
    <div className="workflow-charts" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h3>Code Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[{ name: 'Files', value: chartData.filesAnalyzed }, { name: 'Lines of Code', value: chartData.linesOfCode }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h3>Languages Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sanitizedLanguages}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ language, percent }) => `${language} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {sanitizedLanguages.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkflowChart;