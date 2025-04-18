import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // ⬅️ importar el plugin

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // ⬅️ registrar el plugin
);

const IndicatorChart = ({ data = [], timeframe = '1D' }) => {
  if (!data || data.length === 0) {
    return <p className="text-muted">No hay tasas disponibles.</p>;
  }

  const currentDate = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const getPairLabel = (point) => point.currency || 'Par desconocido';

  const chartData = {
    labels: data.map((point) => getPairLabel(point)),
    datasets: [
      {
        label: `Tasa actual (${currentDate})`,
        data: data.map((point) => point.value),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barThickness: 30,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Tasas de Cambio - ${currentDate}`,
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Tasa: ${context.parsed.y.toFixed(4)} (${currentDate})`,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value) => value.toFixed(4),
        font: {
          weight: 'bold',
          size: 12,
        },
        color: '#000',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: `Tasa de Cambio (${timeframe})`,
        },
        ticks: {
          callback: (value) => value.toFixed(2),
        },
      },
      x: {
        title: {
          display: true,
          text: 'Par de Divisas',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
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
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Tasas de Cambio Actuales
      </h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default IndicatorChart;
