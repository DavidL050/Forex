import React, { useEffect, useState } from 'react';
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
  const [chartData, setChartData] = useState(null);

  // Selecciona el cálculo del indicador según el tipo
  const calculateIndicators = (prices) => {
    switch (indicatorType) {
      case 'RSI':
        return calculateRSI(prices, 14); // RSI de 14 períodos
      case 'MACD':
        return calculateMACD(prices); // MACD con 12,26 períodos
      default:
        return prices;
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      const prices = data.map((point) => point.value);
      const indicatorValues = calculateIndicators(prices);

      const preparedChartData = {
        labels: data.map((point) =>
          new Date(point.timestamp).toLocaleTimeString()
        ),
        datasets: [
          {
            label: `${indicatorType} ${timeframe}`,
            data: indicatorValues,
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
            // Utilizamos la propiedad "context" para acceder al valor del punto (context.raw)
            pointRadius: (context) => (context.raw ? 6 : 0),
            pointBackgroundColor: (context) =>
              context.raw === 1 ? 'green' : 'red',
          },
        ],
      };
      setChartData(preparedChartData);
    }
  }, [data, indicatorType, timeframe]);

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
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Indicador {indicatorType}
        </h2>
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
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

// Función para calcular el RSI de forma iterativa y suavizada
const calculateRSI = (prices, period = 14) => {
  const rsiArray = Array(prices.length).fill(null);
  if (prices.length < period + 1) {
    return rsiArray;
  }

  // Cálculo de las ganancias y pérdidas iniciales
  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gainSum += change;
    } else {
      lossSum += Math.abs(change);
    }
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  rsiArray[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  // Cálculo del RSI para el resto de los datos
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsiArray[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return rsiArray;
};

// Función auxiliar para calcular la EMA (Exponential Moving Average)
const calculateEMA = (prices, period) => {
  const k = 2 / (period + 1);
  const emaArray = [];
  // Para el primer punto se utiliza el precio de cierre
  emaArray[0] = prices[0];
  for (let i = 1; i < prices.length; i++) {
    emaArray[i] = prices[i] * k + emaArray[i - 1] * (1 - k);
  }
  return emaArray;
};

// Función para calcular el MACD utilizando EMA de 12 y 26 períodos
const calculateMACD = (prices) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdArray = ema12.map((val, i) => val - ema26[i]);
  return macdArray;
};

export default IndicatorChart;
