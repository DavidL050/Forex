import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import '../styles/navbar.css'; // Asegúrate de que el archivo esté importado correctamente

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();  // Usamos useNavigate para redirigir

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Verifica si el usuario ha iniciado sesión
  const isAuthenticated = localStorage.getItem('token'); // O el método que estés utilizando para gestionar la autenticación

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token de localStorage
    navigate('/login'); // Redirige al login
  };

  return (
    <div className="navbar">
      <div className="logo">
        <h1>Forex</h1>
      </div>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
      <li><Link to="/">Inicio</Link></li>

        
        {/* Condición para mostrar el botón de "Iniciar sesión" solo si no hay un token */}
        {!isAuthenticated ? (
          <li><Link to="/login" className="btn-login">Iniciar sesión</Link></li>
        ) : (
          <li><button onClick={handleLogout} className="btn-logout">Cerrar sesión</button></li>
        )}
      </ul>
      
    </div>
  );
};

export default Navbar;
