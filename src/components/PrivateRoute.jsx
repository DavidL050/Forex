import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyToken } from '../services/auth'; // Asegúrate de tener esta función para verificar el token

const PrivateRoute = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);  // Estado para indicar si estamos verificando el token
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de si el token es válido
  const location = useLocation(); // Usado para redirigir al login desde la ruta actual si no está autenticado
  const token = localStorage.getItem('token'); // Obtener el token de localStorage

  useEffect(() => {
    // Función para validar el token
    const validateToken = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        // Llamada al servicio para verificar el token
        const isValid = await verifyToken(token); // 'verifyToken' debe devolver un booleano (true si el token es válido)
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('token'); // Eliminar token si hay un error de validación
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    validateToken();
  }, [token]); // Ejecutar la validación solo si el token cambia

  if (isVerifying) {
    // Mostrar un spinner o algo mientras estamos verificando el token
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirige al login y pasa la ubicación para redirigir después
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, renderiza los niños (componente protegido)
  return children;
};

export default PrivateRoute;
