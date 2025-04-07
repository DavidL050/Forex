import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PredictionChart = ({ data, currencyPair }) => {
  const chartData = {
    labels: data.map((point) => new Date(point.date).toLocaleDateString()),
    datasets: [
      {
        label: `${currencyPair} Predicción`,
        data: data.map((point) => point.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Análisis Predictivo ${currencyPair}`,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Valor: ${context.parsed.y.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha',
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor',
        },
        ticks: {
          callback: (value) => value.toFixed(4),
        },
      },
    },
  };

  return (
    <div
      className="card shadow"
      style={{
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PredictionChart;