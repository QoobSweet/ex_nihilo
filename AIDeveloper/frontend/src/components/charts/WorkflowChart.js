import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

/**
 * Workflow Chart Component
 *
 * Displays bar and pie charts for workflow data.
 * Data is pre-sanitized before passing to this component.
 *
 * @param {Array} data - Sanitized workflow data
 */
const WorkflowChart = ({ data }) => {
  const statusCounts = data.reduce((acc, wf) => {
    acc[wf.status] = (acc[wf.status] || 0) + 1;
    return acc;
  }, {});

  const barData = {
    labels: data.map(wf => wf.name),
    datasets: [{
      label: 'Tasks Completed',
      data: data.map(wf => wf.tasks.filter(t => t.completed).length),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };

  return (
    <div>
      <h3>Task Completion Rates</h3>
      <Bar data={barData} />
      <h3>Status Distribution</h3>
      <Pie data={pieData} />
    </div>
  );
};

export { WorkflowChart };