import React, { useState, useEffect } from "react";
import { fetchRates, fetchHistory, getPreferences } from "../services/api";
import FollowCurrencies from "../components/FollowCurrencies";
import IndicatorChart from "../components/IndicatorChart";
import CandlestickChart from "../components/CandlestickChart";



const Dashboard = () => {
  const [rates, setRates] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [historicalData, setHistoricalData] = useState([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const preferencesData = await getPreferences();
      const preferred = preferencesData.preferred_currencies || [];
      setPreferences(preferred);
      setSelectedCurrency(preferred[0] || "");
      setLoadingPreferences(false);

      const ratesData = await fetchRates(preferred);
      setRates(ratesData);
      setLoadingRates(false);
    } catch (err) {
      console.error("Error en Dashboard:", err);
      setError(`Error al cargar datos: ${err.message || "Error desconocido"}`);
      setLoadingPreferences(false);
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    if (selectedCurrency) {
      loadHistory(selectedCurrency);
    }
  }, [selectedCurrency]);

  const loadHistory = async (currency) => {
    setLoadingHistory(true);
    setHistoricalData([]);
    try {
      const data = await fetchHistory(currency);
      console.log("Datos históricos obtenidos:", data);
      setHistoricalData(data);
    } catch (err) {
      console.error("Error al obtener historial:", err);
      setError(`Error al obtener historial: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefresh = async () => {
    setLoadingRates(true);
    setLoadingPreferences(true);
    setError("");
    try {
      const preferencesData = await getPreferences();
      const updatedPreferences = preferencesData.preferred_currencies || [];
      setPreferences(updatedPreferences);
      setSelectedCurrency(updatedPreferences[0] || "");

      const updatedRates = await fetchRates(updatedPreferences);
      setRates(updatedRates);
    } catch (err) {
      console.error("Error al refrescar:", err);
      setError(`Error al refrescar tasas: ${err.message || "Error desconocido"}`);
    } finally {
      setLoadingRates(false);
      setLoadingPreferences(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard de Divisas</h1>

      <FollowCurrencies
        userPreferences={preferences}
        setUserPreferences={setPreferences}
      />

      <div className="refresh-section text-center my-4">
        <button
          className="btn btn-primary d-flex align-items-center justify-content-center"
          onClick={handleRefresh}
          disabled={loadingRates || loadingPreferences}
          style={{ minWidth: '180px', height: '45px' }}
        >
          {loadingRates || loadingPreferences ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Actualizando...
            </>
          ) : (
            "Actualizar tasas"
          )}
        </button>
      </div>

      <h2 className="section-title">Divisas que Sigues:</h2>
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

      <h2 className="section-title">Tasas de Cambio Actuales:</h2>
      {loadingRates ? (
        <p className="loading-text">Cargando tasas de cambio...</p>
      ) : rates.length > 0 ? (
        <div className="chart-container">
          <IndicatorChart data={rates} timeframe="1D" />
        </div>
      ) : (
        <p className="no-data-text">No hay tasas de cambio disponibles.</p>
      )}

      {/* HISTORIAL */}
      <div className="my-5">
        <h2 className="section-title">Histórico de Precios</h2>
        {preferences.length > 0 && (
          <div className="form-group mb-3">
            <label htmlFor="currency-select">Selecciona una Divisa</label>
            <select
              id="currency-select"
              className="form-control"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {preferences.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        )}

        {loadingHistory ? (
          <p className="loading-text">Cargando historial de {selectedCurrency}...</p>
        ) : historicalData.length > 0 ? (
          // Usa el nuevo componente de gráfico de velas aquí
          <CandlestickChart data={historicalData} currencyPair={selectedCurrency} />
        ) : (
          <p className="no-data-text">No hay datos históricos para {selectedCurrency}.</p>
        )}
      </div>

      {error && (
        <div className="dashboard-alert error alert alert-danger mt-3">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dashboard;