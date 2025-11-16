import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartComponentProps {
  data: { [key: string]: number };
}

/**
 * Chart component for workflow statistics visualization
 * @param data - Stats data for the chart
 */
const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Workflow Count',
        data: Object.values(data),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
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
        text: 'Workflow Status Distribution',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default ChartComponent;