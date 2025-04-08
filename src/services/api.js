const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Obtener el token una vez
const getToken = () => localStorage.getItem('token');

// Función para manejar las respuestas de error
const handleError = async (response) => {
  const error = await response.json();
  const errorMessage = error.message || 'Error en la solicitud';
  throw new Error(errorMessage);
};

// Función para obtener preferencias
export const getPreferences = async () => {
  const token = getToken();
  try {
    const response = await fetch(`${BACKEND_URL}/user/preferences`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

// Función de login
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Para manejar cookies de sesión
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json(); // Retorna el token de respuesta
  } catch (error) {
    console.error('Error en el login:', error);
    throw error;
  }
};

// Función para obtener tasas de cambio en tiempo real
export const fetchRates = async (currencyPairs = []) => {
  const token = getToken();
  const query = currencyPairs.length ? `?pairs=${currencyPairs.join(',')}` : '';
  try {
    const response = await fetch(`${BACKEND_URL}/api/rates${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener tasas de cambio:', error);
    throw error;
  }
};

// Función para obtener análisis técnico
export const fetchTechnicalAnalysis = async (currencyPair, timeframe = '1d') => {
  const token = getToken();
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/analysis/${currencyPair}?timeframe=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener análisis técnico:', error);
    throw error;
  }
};

// Función para actualizar preferencias
export const updatePreferences = async (preferences) => {
  const token = getToken();
  try {
    const response = await fetch(`${BACKEND_URL}/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences }),
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

// Función para obtener historial de precios
export const fetchPriceHistory = async (currencyPair, from, to, interval = '1h') => {
  const token = getToken();
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/history/${currencyPair}?from=${from}&to=${to}&interval=${interval}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener historial de precios:', error);
    throw error;
  }
};

// Función para obtener predicciones
export const fetchPredictions = async (currencyPair) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/predictions/${currencyPair}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener predicciones:', error);
    throw error;
  }
};