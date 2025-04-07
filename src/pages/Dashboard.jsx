import React, { useState, useEffect } from "react";
import { fetchRates, getPreferences } from "../services/api";
import FollowCurrencies from "../components/FollowCurrencies";

const Dashboard = () => {
  const [rates, setRates] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [error, setError] = useState("");

  // Obtener tasas de cambio al cargar el componente
  useEffect(() => {
    const getRatesData = async () => {
      try {
        const data = await fetchRates();
        setRates(data);
      } catch (err) {
        setError("Error al cargar las tasas de cambio.");
        console.error(err);
      } finally {
        setLoadingRates(false);
      }
    };

    getRatesData();
  }, []);

  // Obtener las divisas que el usuario sigue
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getPreferences();
        setPreferences(data.preferred_currencies || []);
      } catch (err) {
        setError("Error al cargar las preferencias del usuario.");
        console.error(err);
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchPreferences();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard de Divisas</h1>

      {/* Componente para seguir divisas */}
      <FollowCurrencies userPreferences={preferences} />

      {/* Divisas que el usuario sigue */}
      <h2 className="section-title">Divisas que sigues:</h2>
      {loadingPreferences ? (
        <p className="loading-text">Cargando preferencias...</p>
      ) : preferences.length > 0 ? (
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

      {/* Tasas de cambio */}
      <h2 className="section-title">Tasas de Cambio:</h2>
      {loadingRates ? (
        <p className="loading-text">Cargando tasas de cambio...</p>
      ) : rates.length > 0 ? (
        <ul className="rates-list">
          {rates.map((rate, index) => (
            <li key={index} className="rates-item">
              <span>{rate.currency}</span>
              <span className="rate-value">{rate.rate}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data-text">No hay tasas de cambio disponibles.</p>
      )}

      {/* Mostrar errores si existen */}
      {error && (
        <div className="dashboard-alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;