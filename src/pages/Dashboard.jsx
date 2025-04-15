import React, { useState, useEffect } from "react";
import { fetchRates, getPreferences } from "../services/api";
import FollowCurrencies from "../components/FollowCurrencies";
import IndicatorChart from "../components/IndicatorChart";

const Dashboard = () => {
  const [rates, setRates] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [error, setError] = useState("");

  // Obtener tasas de cambio y preferencias al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Primero obtenemos las preferencias del usuario
        const preferencesData = await getPreferences();
        setPreferences(preferencesData.preferred_currencies || []);
        setLoadingPreferences(false);
        
        // Luego obtenemos las tasas de cambio basadas en las preferencias
        const currencyPairs = preferencesData.preferred_currencies || [];
        const ratesData = await fetchRates(currencyPairs);
        setRates(ratesData);
        setLoadingRates(false);
      } catch (err) {
        console.error("Error en Dashboard:", err);
        setError(`Error al cargar datos: ${err.message || "Error desconocido"}`);
        setLoadingRates(false);
        setLoadingPreferences(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setLoadingRates(true);
    setError("");
    
    try {
      const ratesData = await fetchRates(preferences);
      setRates(ratesData);
    } catch (err) {
      console.error("Error al refrescar tasas:", err);
      setError(`Error al refrescar tasas: ${err.message || "Error desconocido"}`);
    } finally {
      setLoadingRates(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard de Divisas</h1>
      
      {/* Componente para seguir divisas */}
      <FollowCurrencies 
        userPreferences={preferences} 
        setUserPreferences={setPreferences}
      />
      
      {/* Botón para refrescar tasas */}
      <div className="refresh-section">
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={loadingRates}
        >
          {loadingRates ? "Actualizando..." : "Actualizar tasas"}
        </button>
      </div>
      
      {/* Divisas que el usuario sigue */}
      <h2 className="section-title">Divisas que sigues:</h2>
      {loadingPreferences ? (
        <p className="loading-text">Cargando preferencias...</p>
      ) : preferences && preferences.length > 0 ? (
        <ul className="preferences-list">
          {preferences.map((currency, index) => (
            <li key={index} className="preferences-item">
              {currency}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data-text">No sigues ninguna divisa todavía.</p>
      )}
      
      {/* Mostrar gráfico de tasas de cambio */}
      <h2 className="section-title">Tasas de Cambio Actuales:</h2>
      {loadingRates ? (
        <p className="loading-text">Cargando tasas de cambio...</p>
      ) : rates && rates.length > 0 ? (
        <div className="chart-container">
          <IndicatorChart 
            data={rates} 
            indicatorType="RSI" 
            timeframe="1D" 
          />
        </div>
      ) : (
        <p className="no-data-text">No hay tasas de cambio disponibles.</p>
      )}
      
      {/* Mostrar errores si existen */}
      {error && (
        <div className="dashboard-alert error">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;