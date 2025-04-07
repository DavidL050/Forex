const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';


export const getPreferences = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${BACKEND_URL}/user/preferences`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching preferences');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch preferences error:', error);
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
      const error = await response.json();
      throw new Error(error.message || 'Error durante el login');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Función para obtener tasas de cambio en tiempo real
export const fetchRates = async (currencyPairs = []) => {
  try {
    const token = localStorage.getItem('token');
    const query = currencyPairs.length ? `?pairs=${currencyPairs.join(',')}` : '';
    
    const response = await fetch(`${BACKEND_URL}/api/rates${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching rates');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch rates error:', error);
    throw error;
  }
};

// Función para obtener análisis técnico
export const fetchTechnicalAnalysis = async (currencyPair, timeframe = '1d') => {
  try {
    const token = localStorage.getItem('token');
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
      throw new Error('Error fetching technical analysis');
    }

    return await response.json();
  } catch (error) {
    console.error('Technical analysis error:', error);
    throw error;
  }
};

// Función para actualizar preferencias
export const updatePreferences = async (preferences) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BACKEND_URL}/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar preferencias');
    }

    return await response.json();
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

// Función para obtener historial de precios
export const fetchPriceHistory = async (currencyPair, from, to, interval = '1h') => {
  try {
    const token = localStorage.getItem('token');
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
      throw new Error('Error fetching price history');
    }

    return await response.json();
  } catch (error) {
    console.error('Price history error:', error);
    throw error;
  }
};

// Función para obtener predicciones
export const fetchPredictions = async (currencyPair) => {
  try {
    const token = localStorage.getItem('token');
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
      throw new Error('Error fetching predictions');
    }

    return await response.json();
  } catch (error) {
    console.error('Predictions error:', error);
    throw error;
  }
};