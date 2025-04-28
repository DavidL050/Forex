import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="app-layout">
      {/* Barra de navegación */}
      <Navbar />
      
      {/* Contenedor principal para el contenido */}
      <main className="main-container">
        <Outlet />
      </main>

      
      {/* <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 My App. Todos los derechos reservados.</p>
        </div>
      </footer> */}
    </div>
  );
};

export default Layout;
