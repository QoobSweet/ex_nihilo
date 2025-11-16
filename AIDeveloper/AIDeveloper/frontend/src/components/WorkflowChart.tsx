import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { processChartData } from '../utils/chartDataHelpers';
import DOMPurify from 'dompurify';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface WorkflowChartProps {
  workflows: Array<{
    id: number;
    name: string;
    status: 'pending' | 'in-progress' | 'completed';
    progress: number;
  }>;
}

/**
 * WorkflowChart component displays visual charts for workflow data.
 *
 * @param workflows - Array of workflow objects with status and progress data
 * @returns JSX element rendering pie and bar charts
 *
 * @security Sanitizes workflow names before rendering to prevent XSS
 */
const WorkflowChart: React.FC<WorkflowChartProps> = ({ workflows }) => {
  const chartData = useMemo(() => processChartData(workflows), [workflows]);

  // Sanitize workflow names for display
  const sanitizedWorkflows = workflows.map(w => ({
    ...w,
    name: DOMPurify.sanitize(w.name)
  }));

  const pieData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [chartData.pending, chartData.inProgress, chartData.completed],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const barData = {
    labels: sanitizedWorkflows.map(w => w.name),
    datasets: [
      {
        label: 'Progress (%)',
        data: sanitizedWorkflows.map(w => w.progress),
        backgroundColor: '#4BC0C0',
      },
    ],
  };

  return (
    <div className="workflow-charts">
      <div className="chart-container">
        <h3>Workflow Status Distribution</h3>
        <Pie data={pieData} />
      </div>
      <div className="chart-container">
        <h3>Workflow Progress</h3>
        <Bar data={barData} />
      </div>
    </div>
  );
};

export default WorkflowChart;