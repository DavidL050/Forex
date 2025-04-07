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
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const IndicatorChart = ({ data = [], indicatorType = 'RSI', timeframe = '1D' }) => {
  // Calculate technical indicators
  const calculateIndicators = (prices) => {
    switch (indicatorType) {
      case 'RSI':
        return calculateRSI(prices, 14); // 14-period RSI
      case 'MACD':
        return calculateMACD(prices); // 12,26,9 MACD
      default:
        return prices;
    }
  };

  const chartData = {
    labels: data.map((point) => new Date(point.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${indicatorType} ${timeframe}`,
        data: calculateIndicators(data.map((point) => point.value)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Señales',
        data: data.map((point) => point.signal),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        pointRadius: (point) => (point.signal ? 6 : 0),
        pointBackgroundColor: (point) => (point.signal === 1 ? 'green' : 'red'),
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.dataset.label === 'Señales') {
              return context.raw === 1 ? 'Señal de Compra' : 'Señal de Venta';
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: (value) => value.toFixed(2),
        },
      },
      x: {
        grid: {
          display: false,
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
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Indicador {indicatorType}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span
            className="badge bg-success"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            }}
          >
            Timeframe: {timeframe}
          </span>
          <span
            className="badge bg-primary"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#cce5ff',
              color: '#004085',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            }}
          >
            Período: 14
          </span>
        </div>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

// Utility functions for technical indicators
const calculateRSI = (prices, period = 14) => {
  const gains = [];
  const losses = [];

  for (let i = 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    gains.push(difference > 0 ? difference : 0);
    losses.push(difference < 0 ? Math.abs(difference) : 0);
  }

  const avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  const avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  const rsi = 100 - 100 / (1 + avgGain / avgLoss);
  return Array(period).fill(null).concat(Array(prices.length - period).fill(rsi));
};

const calculateMACD = (prices) => {
  // Simplified MACD calculation
  const ema12 = prices.map((price, i) => {
    if (i < 12) return price;
    return price * 0.15 + prices[i - 1] * 0.85;
  });

  const ema26 = prices.map((price, i) => {
    if (i < 26) return price;
    return price * 0.075 + prices[i - 1] * 0.925;
  });

  return ema12.map((v, i) => v - ema26[i]);
};

export default IndicatorChart;