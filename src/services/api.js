const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Función de login
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();

    if (data.token) {
      // Store token without any modifications
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAuthenticated', 'true');
      return data;
    } else {
      throw new Error(data.message || 'No token received from server');
    }
  } catch (error) {
    console.error('Error durante el login:', error);
    throw error;
  }
};

// Función de logout
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logout failed');
    }

    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    return await response.json();
  } catch (error) {
    console.error('Error durante el logout:', error);
    throw error;
  }
};

// Función para manejar las respuestas de error
const handleError = async (response) => {
  let errorMessage = 'Error en la solicitud';
  try {
    const error = await response.json();
    errorMessage = error.message || errorMessage;
  } catch (e) {
    console.error('Error al procesar la respuesta de error:', e);
  }
  throw new Error(errorMessage);
};

// Función para obtener preferencias del usuario
export const getPreferences = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token no encontrado en localStorage');
    throw new Error('No se encontró el token');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/user/preferences`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener preferencias:', error);
    throw error;
  }
};

// Función para actualizar preferencias del usuario
export const updatePreferences = async (preferences) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    throw error;
  }
};

// Función para obtener las monedas disponibles
export const fetchCurrencies = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/currencies`);
    if (!response.ok) {
      throw new Error('Error al obtener las monedas');
    }
    return await response.json();  // Retorna las monedas
  } catch (error) {
    console.error('Error al obtener las monedas:', error);
    throw error;
  }
};

// Función para obtener las tasas de cambio
export const fetchRates = async (currencyPairs = []) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const query = currencyPairs.length ? `?pairs=${currencyPairs.join(',')}` : '';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/rates${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching exchange rates');
    }

    // Parse the response as JSON
    const rates = await response.json();
    console.log('Rates Response:', rates);

    // Format the data for charts or display
    const formattedData = Object.keys(rates).map((currency) => ({
      timestamp: new Date().toISOString(),
      value: rates[currency],
      currency: currency,
    }));

    return formattedData;
  } catch (error) {
    console.error('Error al obtener tasas de cambio:', error);
    throw error;
  }
};

// Función para obtener análisis técnico
export const fetchAnalysis = async (currencyPair) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/analysis/${currencyPair}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al obtener análisis para ${currencyPair}:`, error);
    throw error;
  }
};

// Función para obtener historial de precios
export const fetchHistory = async (currencyPair) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/history/${currencyPair}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al obtener historial para ${currencyPair}:`, error);
    throw error;
  }
};