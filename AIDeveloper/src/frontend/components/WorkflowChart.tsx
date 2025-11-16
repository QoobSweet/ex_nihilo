import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { sanitizeInput } from '../utils/securityUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface WorkflowData {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  stats: { completed: number; pending: number; failed: number };
}

interface WorkflowChartProps {
  data: WorkflowData[];
}

/**
 * Workflow Chart Component
 *
 * Displays bar chart for workflow statistics.
 * Sanitizes all labels to prevent XSS.
 *
 * @param data - Array of workflow data
 * @returns JSX.Element
 */
const WorkflowChart: React.FC<WorkflowChartProps> = ({ data }) => {
  const labels = data.map(wf => sanitizeInput(wf.name));
  const completed = data.map(wf => wf.stats.completed);
  const pending = data.map(wf => wf.stats.pending);
  const failed = data.map(wf => wf.stats.failed);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Completed',
        data: completed,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Pending',
        data: pending,
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
      {
        label: 'Failed',
        data: failed,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Workflow Statistics',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default WorkflowChart;