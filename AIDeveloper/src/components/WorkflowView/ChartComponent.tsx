import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DOMPurify from 'dompurify';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

interface ChartComponentProps {
  data: ChartData;
  title: string;
}

/**
 * Reusable chart component for displaying codebase statistics
 *
 * @param data - The chart data, validated and sanitized
 * @param title - The chart title
 * @returns A bar chart component
 *
 * @security Data is assumed to be sanitized before passing; component uses DOMPurify for any dynamic content
 */
export const ChartComponent: React.FC<ChartComponentProps> = ({ data, title }) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  useEffect(() => {
    // Ensure chart updates on data change
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: DOMPurify.sanitize(title), // Sanitize title to prevent XSS
      },
    },
  };

  return (
    <div className="chart-container" style={{ width: '100%', height: '400px' }}>
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  );
};
