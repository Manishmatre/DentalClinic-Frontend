import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register required ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

/**
 * Reusable pie chart component for dashboards
 * 
 * @param {Object} data - Chart data object with labels and datasets
 * @param {Object} options - Chart options (optional)
 * @param {Number} height - Chart height in pixels (optional)
 */
const PieChart = ({ data, options = {}, height = 250 }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(53, 71, 125, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 4,
        displayColors: true
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Pie data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
};

export default PieChart;
