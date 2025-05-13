import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Globe, DollarSign, Clock, Bell, Info, BarChart2 } from 'lucide-react';
import { handleLogout } from '../components/Navbar'; 


const ForexLandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');

  const eurusdData = [
    { name: '9:00', value: 1.0921 },
    { name: '10:00', value: 1.0925 },
    { name: '11:00', value: 1.0918 },
    { name: '12:00', value: 1.0930 },
    { name: '13:00', value: 1.0945 },
    { name: '14:00', value: 1.0938 },
    { name: '15:00', value: 1.0952 },
  ];

  const gbpusdData = [
    { name: '9:00', value: 1.2734 },
    { name: '10:00', value: 1.2728 },
    { name: '11:00', value: 1.2738 },
    { name: '12:00', value: 1.2745 },
    { name: '13:00', value: 1.2752 },
    { name: '14:00', value: 1.2768 },
    { name: '15:00', value: 1.2771 },
  ];

  const usdcadData = [
    { name: '9:00', value: 1.3521 },
    { name: '10:00', value: 1.3528 },
    { name: '11:00', value: 1.3522 },
    { name: '12:00', value: 1.3514 },
    { name: '13:00', value: 1.3498 },
    { name: '14:00', value: 1.3495 },
    { name: '15:00', value: 1.3489 },
  ];

  // Datos de noticias financieras
  const newsItems = [
    {
      title: "La Fed mantiene tasas de interés",
      time: "Hace 30 min",
      summary: "La Reserva Federal de EE.UU. mantiene las tasas de interés sin cambios en su última reunión."
    },
    {
      title: "EUR/USD alcanza máximos de 3 meses",
      time: "Hace 1 hora",
      summary: "El par EUR/USD alcanzó su nivel más alto en tres meses tras datos económicos positivos en la Eurozona."
    },
    {
      title: "Banco de Inglaterra anticipa cambios",
      time: "Hace 2 horas",
      summary: "El Banco de Inglaterra señala posibles ajustes en su política monetaria para el próximo trimestre."
    }
  ];

  // Datos de pares de divisas populares
  const popularPairs = [
    { pair: "EUR/USD", value: "1.0952", change: "+0.23%", trend: "up" },
    { pair: "GBP/USD", value: "1.2771", change: "+0.29%", trend: "up" },
    { pair: "USD/JPY", value: "151.32", change: "-0.15%", trend: "down" },
    { pair: "USD/CAD", value: "1.3489", change: "-0.24%", trend: "down" },
    { pair: "AUD/USD", value: "0.6587", change: "+0.18%", trend: "up" },
    { pair: "USD/CHF", value: "0.9032", change: "-0.08%", trend: "down" },
  ];

  // Estadísticas del mercado
  const marketStats = [
    { label: "Volatilidad EUR/USD", value: "0.43%" },
    { label: "Spread promedio", value: "1.2 pips" },
    { label: "Volumen de operaciones", value: "+12.5%" },
    { label: "Sesiones activas", value: "Europa/Asia" }
  ];

  return (
    <div className="landing-container">
      <header className="header">
        <div className="logo">Forex</div>
        <nav className="nav-links">
          <a href="/" className="nav-link">Inicio</a>
          <a href="/dashboard" className="nav-link">Dashboard</a>
        </nav>

        {/* Mostrar el botón de "Cerrar sesión" solo si el usuario está autenticado */}
        {isAuthenticated ? (
          <button onClick={handleLogout} className="logout-btn">Cerrar sesión</button>
        ) : (
          <a href="/login" className="btn-login">Iniciar sesión</a>
        )}
      </header>
      
      <main className="main-content">
        <div className="hero-section">
          <div className="welcome-card">
            <h1 className="landing-title">Tu plataforma de análisis de divisas en tiempo real</h1>
            <p className="landing-text">
              Obtén información precisa y toma decisiones informadas sobre tus inversiones en el mercado de divisas.
            </p>
            <div className="action-buttons">
              <button className="primary-btn">Ver mercados</button>
              <button className="secondary-btn">Aprender más</button>
            </div>
          </div>
        </div>
        
        <div className="content-grid">
          {/* Panel de pares de divisas populares */}
          <div className="content-card currency-pairs-card">
            <div className="card-header">
              <Globe size={20} />
              <h2>Pares populares</h2>
            </div>
            <div className="currency-pairs-list">
              {popularPairs.map((item, index) => (
                <div key={index} className="currency-pair-item">
                  <div className="pair-name">{item.pair}</div>
                  <div className="pair-value">{item.value}</div>
                  <div className={`pair-change ${item.trend}`}>
                    {item.trend === "up" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de gráficos */}
          <div className="content-card chart-card">
            <div className="card-header">
              <BarChart2 size={20} />
              <h2>EUR/USD</h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={eurusdData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={['dataMin - 0.001', 'dataMax + 0.001']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0066cc" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Panel de noticias financieras */}
          <div className="content-card news-card">
            <div className="card-header">
              <Bell size={20} />
              <h2>Noticias del mercado</h2>
            </div>
            <div className="news-list">
              {newsItems.map((news, index) => (
                <div key={index} className="news-item">
                  <div className="news-title">{news.title}</div>
                  <div className="news-time">{news.time}</div>
                  <div className="news-summary">{news.summary}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel con más gráficos */}
          <div className="content-card chart-grid">
            <div className="mini-chart">
              <div className="mini-chart-header">
                <h3>GBP/USD</h3>
                <span className="up">+0.29%</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={gbpusdData}>
                  <YAxis domain={['dataMin - 0.001', 'dataMax + 0.001']} hide={true} />
                  <Line type="monotone" dataKey="value" stroke="#28a745" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mini-chart">
              <div className="mini-chart-header">
                <h3>USD/CAD</h3>
                <span className="down">-0.24%</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={usdcadData}>
                  <YAxis domain={['dataMin - 0.001', 'dataMax + 0.001']} hide={true} />
                  <Line type="monotone" dataKey="value" stroke="#dc3545" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Panel de estadísticas */}
          <div className="content-card stats-card">
            <div className="card-header">
              <Info size={20} />
              <h2>Estadísticas de mercado</h2>
            </div>
            <div className="stats-grid">
              {marketStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <p>© {new Date().getFullYear()} Forex - Plataforma de análisis de divisas</p>
      </footer>

      <style>{`
        /* Estilos generales */
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          color: #333;
          width: 100%;
          overflow-x: hidden;
        }
        
        .landing-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
        }
        
        /* Estilos del header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background-color: #003366;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-links:hover {
          color: #005bb5;
        }
        .nav-link {
          color: white;
          text-decoration: none;
          font-size: 16px;
        }
        .btn-login {
          color: #fff;
      }
        
        .logout-btn {
          background-color: #ff4d4d;
          color: white;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .logout-btn:hover {
          background-color: #e60000;
        }
        
        /* Estilos del contenido principal */
        .main-content {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .hero-section {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
          width: 100%;
        }
        
        .welcome-card {
          text-align: center;
          background-color: white;
          border-radius: 10px;
          padding: 32px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 1200px;
        }
        
        .landing-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #003366;
        }
        
        .landing-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 24px;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        
        .primary-btn, .secondary-btn {
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        
        .primary-btn {
          background-color: #0066cc;
          color: white;
        }
        
        .secondary-btn {
          background-color: #f0f0f0;
          color: #0066cc;
        }
        
        .primary-btn:hover {
          background-color: #005bb5;
        }
        
        .secondary-btn:hover {
          background-color: #e0e0e0;
        }
        
        /* Grid de contenido */
        .content-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .content-card {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }
        
        .card-header {
          padding: 16px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .card-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        /* Card de pares de divisas */
        .currency-pairs-card {
          grid-column: 1;
          grid-row: 1 / span 2;
        }
        
        .currency-pairs-list {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .currency-pair-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .currency-pair-item:hover {
          background-color: #f5f5f5;
        }
        
        .pair-name {
          font-weight: 600;
        }
        
        .pair-value {
          font-size: 15px;
        }
        
        .pair-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }
        
        .pair-change.up {
          color: #28a745;
        }
        
        .pair-change.down {
          color: #dc3545;
        }
        
        /* Card de gráficos */
        .chart-card {
          grid-column: 2 / span 2;
          grid-row: 1;
        }
        
        .chart-container {
          padding: 16px;
        }
        
        /* Card de noticias */
        .news-card {
          grid-column: 2;
          grid-row: 2;
        }
        
        .news-list {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .news-item {
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
        }
        
        .news-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        
        .news-title {
          font-weight: 600;
          margin-bottom: 6px;
        }
        
        .news-time {
          font-size: 12px;
          color: #777;
          margin-bottom: 6px;
        }
        
        .news-summary {
          font-size: 14px;
          color: #555;
        }
        
        /* Card de gráficos múltiples */
        .chart-grid {
          grid-column: 3;
          grid-row: 2;
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 16px;
          padding: 16px;
        }
        
        .mini-chart {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 12px;
        }
        
        .mini-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .mini-chart-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .mini-chart-header .up {
          color: #28a745;
        }
        
        .mini-chart-header .down {
          color: #dc3545;
        }
        
        /* Card de estadísticas */
        .stats-card {
          grid-column: 1 / span 3;
          grid-row: 3;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 16px;
          gap: 16px;
        }
        
        .stat-item {
          text-align: center;
          padding: 16px;
          background-color: #f8f9fa;
          border-radius: 6px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #003366;
        }
        
        /* Footer */
        .footer {
          padding: 16px;
          text-align: center;
          background-color: #003366;
          color: white;
          font-size: 14px;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          .content-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .currency-pairs-card {
            grid-column: 1;
            grid-row: 1;
          }
          
          .chart-card {
            grid-column: 2;
            grid-row: 1;
          }
          
          .news-card {
            grid-column: 1;
            grid-row: 2;
          }
          
          .chart-grid {
            grid-column: 2;
            grid-row: 2;
          }
          
          .stats-card {
            grid-column: 1 / span 2;
            grid-row: 3;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .currency-pairs-card,
          .chart-card,
          .news-card,
          .chart-grid,
          .stats-card {
            grid-column: 1;
          }
          
          .currency-pairs-card {
            grid-row: 1;
          }
          
          .chart-card {
            grid-row: 2;
          }
          
          .news-card {
            grid-row: 3;
          }
          
          .chart-grid {
            grid-row: 4;
          }
          
          .stats-card {
            grid-row: 5;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ForexLandingPage;