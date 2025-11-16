import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface CodebaseStats {
  totalFiles: number;
  totalLines: number;
  languages: { [key: string]: number };
}

interface CodebaseStatsChartProps {
  stats: CodebaseStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

/**
 * Component for visualizing codebase statistics using charts.
 *
 * @param stats - The codebase statistics data
 */
export const CodebaseStatsChart: React.FC<CodebaseStatsChartProps> = ({ stats }) => {
  const barData = [
    { name: 'Total Files', value: stats.totalFiles },
    { name: 'Total Lines', value: stats.totalLines },
  ];

  const pieData = Object.entries(stats.languages).map(([language, count]) => ({
    name: language,
    value: count,
  }));

  return (
    <div className="codebase-stats-chart">
      <h2>Codebase Statistics</h2>
      <div className="chart-container">
        <BarChart width={400} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            cx={200}
            cy={150}
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
};
