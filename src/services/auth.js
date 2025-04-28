// Importamos la URL base
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const verifyToken = async () => {
  try {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${BACKEND_URL}/api/verify-token`, {
      method: 'GET', // Cambiado a GET para que coincida con los métodos permitidos en el backend
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include', // Para incluir cookies si se necesitan
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.status}`);
    }
    
    // Procesar la respuesta del servidor
    const data = await response.json();
    
    // Verificar que el servidor haya devuelto el campo 'isValid'
    if (data && data.isValid) {
      return true;
    } else {
      throw new Error('Token not valid');
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return false; // Devuelve false si hay algún error o la validación falla
  }
};

// También podemos agregar otras funciones de autenticación aquí
export const isAuthenticated = async () => {
  return await verifyToken();
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};