import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, verifyToken } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Intentar iniciar sesión
      await loginUser(username, password);
      
      // Verificar que el token es válido
      await verifyToken();
      
      // Limpiar los campos
      setUsername('');
      setPassword('');
      
      // Redirigir al dashboard después de login exitoso
      navigate('/dashboard');
    } catch (error) {
      console.error('Error durante el login:', error);
      setError(error.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center text-primary mb-4">Forex</h2>
        <p className="text-center text-muted mb-4">Inicia Sesión para Acceder a tu Dashboard</p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="d-grid">
            <button
              type="submit"
              disabled={isLoading}
              className={`btn ${isLoading ? 'btn-secondary' : 'btn-primary'}`}
            >
              {isLoading ? (
                <div className="d-flex align-items-center justify-content-center">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;