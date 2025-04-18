import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          Forex Dashboard
        </Link>
        <button onClick={handleLogout} className="nav-link">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
