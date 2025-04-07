import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyToken } from '../services/auth';

const PrivateRoute = ({ children }) => {
  /* const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const isValid = await verifyToken(token);
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    validateToken();
  }, [token]);

  if (isVerifying) {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
*/
  return children;
};

export default PrivateRoute;