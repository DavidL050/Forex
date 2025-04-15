import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api'; // Importando la función loginUser

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await loginUser(username, password);
      
      if (response && response.token) {
        // Guardar token y estado de autenticación
        localStorage.setItem('token', response.token);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Verificar que el token se haya guardado correctamente
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          throw new Error('No se pudo guardar el token en el navegador');
        }
        
        console.log('Login exitoso, redirigiendo al dashboard');
        navigate('/dashboard');
      } else {
        setError('Respuesta inválida del servidor');
      }
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
        <h2 className="text-center text-primary mb-4">Forex Dashboard</h2>
        <p className="text-center text-muted mb-4">Inicia sesión para acceder a tu dashboard</p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        
        <div className="mt-3 text-center">
          <small className="text-muted">
            Para fines de demostración: Usuario: demo, Contraseña: demo123
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;