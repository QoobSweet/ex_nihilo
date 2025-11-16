import React from 'react';
// @ts-ignore - Recharts types are imported via package.json
// Security: Recharts is a trusted library; no direct user input rendering
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ChartDataPoint } from '../types/workflow'; // Assuming types defined

interface WorkflowChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'pie';
  title: string;
}

/**
 * Component for rendering workflow data as charts.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @security Data is assumed sanitized from API; no direct user input rendering
 */
const WorkflowChart: React.FC<WorkflowChartProps> = ({ data, type, title }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No data available for chart.</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={{ margin: '20px 0' }}>
      <h3>{title}</h3>
      {type === 'bar' ? (
        <BarChart width={400} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      ) : (
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            cx={200}
            cy={150}
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )}
    </div>
  );
};

export default WorkflowChart;