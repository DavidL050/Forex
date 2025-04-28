import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const Landing = () => {
  const navigate = useNavigate(); // Usamos useNavigate para redirigir
  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('token'); // O usa tu mecanismo para verificar autenticación

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token de localStorage
    navigate('/login'); // Redirige al login
  };

  return (
    <div>
      {/* Barra de navegación */}
      <header>
        <nav>
          <div className="logo">
            <h1>Forex</h1>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Inicio</Link></li>
            {/* Mostrar el botón "Dashboard" solo si el usuario está autenticado */}
            {isAuthenticated && (
              <li><Link to="/dashboard" className="btn-dashboard">Dashboard</Link></li>
            )}
            {/* Si el usuario no está autenticado, mostrar botón de iniciar sesión */}
            {!isAuthenticated ? (
              <li><Link to="/login" className="btn-login">Iniciar sesión</Link></li>
            ) : (
              <li><button onClick={handleLogout} className="btn-logout">Cerrar sesión</button></li>
            )}
          </ul>
        </nav>
      </header>

      {/* Sección principal de bienvenida */}
      <section id="home" className="welcome-section">
        <h2>Bienvenido a Forex</h2>
        <p>Tu plataforma de análisis de divisas en tiempo real. Obtén información precisa y toma decisiones informadas.</p>
        {!isAuthenticated ? (
          <Link to="/login" className="cta-btn">Iniciar sesión</Link>
        ) : (
          <p></p> // O cualquier otra cosa que desees mostrar
        )}
      </section>

      {/* Características */}
      <section id="features">
        <h2>Características</h2>
        <div className="features-container">
          <div className="feature">
            <h3>Datos en Tiempo Real</h3>
            <p>Consulta las tasas de cambio actualizadas al momento para las principales divisas.</p>
          </div>
          <div className="feature">
            <h3>Gráficos Interactivos</h3>
            <p>Visualiza la evolución histórica de las divisas con gráficos dinámicos.</p>
          </div>
          <div className="feature">
            <h3>Alertas Personalizadas</h3>
            <p>Configura alertas para que te notifiquemos cuando haya cambios significativos en las divisas que te interesan.</p>
          </div>
        </div>
      </section>

      {/* Sección sobre nosotros */}
      <section id="about">
        <h2>¿Quiénes somos?</h2>
        <p>En Forex, nuestro objetivo es proporcionar herramientas precisas y fáciles de usar para el análisis de divisas y datos financieros.</p>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2025 Forex - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Landing;
