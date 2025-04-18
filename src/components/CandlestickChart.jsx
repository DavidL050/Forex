import React, { useRef, useEffect } from 'react';
import { createChart } from 'lightweight-charts'; // ← NO toques esto

const CandlestickChart = ({ data = [], currencyPair = "EUR/USD" }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Limpiar gráfico anterior si existe
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Crear nuevo gráfico
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#d6d6d6',
      },
      timeScale: {
        borderColor: '#d6d6d6',
      },
      watermark: {
        visible: true,
        fontSize: 24,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(171, 71, 188, 0.1)',
        text: currencyPair,
      },
    });

    chartRef.current = chart;

console.log("Chart instance:", chart);
console.log("Métodos disponibles en chart:", Object.keys(chart));

    // Crear serie de velas
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Formatear datos
    const formattedData = data.map(item => ({
      time: item.date || item.x,
      open: item.open || item.o,
      high: item.high || item.h,
      low: item.low || item.l,
      close: item.close || item.c
    }));

    // Establecer datos
    candleSeries.setData(formattedData);

    // Ajustar vista
    chart.timeScale().fitContent();

    // Manejar redimensionamiento
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chart.remove();
        chartRef.current = null;
      }
    };
  }, [data, currencyPair]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center mt-4 text-muted">
        No hay datos históricos disponibles para {currencyPair}.
      </div>
    );
  }

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
      <h3 className="mb-3">Evolución Histórica de {currencyPair}</h3>
      <div 
        ref={chartContainerRef} 
        style={{ height: '400px', width: '100%' }}
      />
    </div>
  );
};

export default CandlestickChart;