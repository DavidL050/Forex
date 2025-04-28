const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Función genérica para manejar peticiones fetch
const fetchData = async (url, options = {}) => {
  try {
    // Asegurarse de que options.headers existe
    if (!options.headers) {
      options.headers = { 'Content-Type': 'application/json' };
    }
    
    // Incluir el token en el header de Authorization si existe en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Siempre incluir credentials para manejar cookies
    options.credentials = 'include';
    
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    throw error;
  }
};

// Función para manejar errores de respuesta
const handleError = async (response) => {
  let errorMessage;
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || `Error del servidor: ${response.status}`;
  } catch (e) {
    errorMessage = `Error del servidor: ${response.status}`;
  }
  throw new Error(errorMessage);
};

// Función para verificar el token
export const verifyToken = async () => {
  return await fetchData(`${BACKEND_URL}/api/verify-token`);
};

// Función para hacer login
export const loginUser = async (username, password) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  };

  const data = await fetchData(`${BACKEND_URL}/api/login`, options);

  // Asumimos que el backend devuelve el token al hacer login
  if (data.token) {
    localStorage.setItem('token', data.token); // Guardar token en localStorage
  }
  
  return data;
};

// Función para hacer logout
export const logoutUser = async () => {
  const options = {
    method: 'POST',
  };

  await fetchData(`${BACKEND_URL}/api/logout`, options);
  localStorage.removeItem('token');  // Limpiar el token después de logout
};

// Obtener preferencias
export const getPreferences = async () => {
  return await fetchData(`${BACKEND_URL}/api/user/preferences`);
};

// Actualizar preferencias
export const updatePreferences = async (preferences) => {
  const options = {
    method: 'PUT',
    body: JSON.stringify(preferences),
  };

  return await fetchData(`${BACKEND_URL}/api/user/preferences`, options);
};

// Obtener lista de monedas
export const fetchCurrencies = async () => {
  return await fetchData(`${BACKEND_URL}/api/currencies`);
};

// Obtener tasas de cambio
export const fetchRates = async (currencyPairs = []) => {
  const query = currencyPairs.length ? `?pairs=${currencyPairs.join(',')}` : '';
  
  const rates = await fetchData(`${BACKEND_URL}/api/rates${query}`);
  return Object.keys(rates).map(currency => ({
    timestamp: new Date().toISOString(),
    value: rates[currency],
    currency,
  }));
};

// Obtener análisis técnico
export const fetchAnalysis = async (currencyPair) => {
  return await fetchData(`${BACKEND_URL}/api/analysis/${currencyPair}`);
};

// Obtener historial de precios OHLC
export const fetchHistory = async (currencyPair) => {
  const data = await fetchData(`${BACKEND_URL}/api/history/${encodeURIComponent(currencyPair)}`);

  // Verificamos que data sea un array y tenga estructura correcta
  if (!Array.isArray(data)) throw new Error('Datos de historial inválidos');

  return data.map(entry => ({
    x: entry.date,
    o: parseFloat(entry.open),
    h: parseFloat(entry.high),
    l: parseFloat(entry.low),
    c: parseFloat(entry.close),
  }));
};