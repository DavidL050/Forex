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
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px 24px",
      fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      color: "#1d1d1f",
      backgroundColor: "#fbfbfd",
      minHeight: "100vh"
    }}>
      <h1 style={{
        fontSize: "48px",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: "48px",
        color: "#1d1d1f",
        letterSpacing: "-0.5px",
        background: "linear-gradient(to right, #007bff, #552010)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>
        Dashboard de Divisas
      </h1>

      {/* Panel principal */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        marginBottom: "40px",
        transition: "all 0.3s ease"
      }}>
        <FollowCurrencies
          userPreferences={preferences}
          setUserPreferences={setPreferences}
        />

        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "32px",
          marginBottom: "32px"
        }}>
          <button
            onClick={handleRefresh}
            disabled={loadingRates || loadingPreferences}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0071e3",
              color: "white",
              border: "none",
              borderRadius: "20px",
              padding: "12px 28px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: loadingRates || loadingPreferences ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 10px rgba(0, 113, 227, 0.3)",
              minWidth: "180px",
              height: "45px",
              opacity: loadingRates || loadingPreferences ? "0.7" : "1"
            }}
          >
            {loadingRates || loadingPreferences ? (
              <>
                <span style={{
                  display: "inline-block",
                  width: "18px",
                  height: "18px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderTopColor: "#ffffff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginRight: "12px"
                }} />
                Actualizando...
              </>
            ) : (
              "Actualizar tasas"
            )}
          </button>
        </div>

        {/* Divisas que sigues */}
        <h2 style={{
          fontSize: "28px",
          fontWeight: "600",
          marginBottom: "24px",
          color: "#1d1d1f",
          letterSpacing: "-0.3px"
        }}>
          Divisas que Sigues
        </h2>
        
        {loadingPreferences ? (
          <p style={{
            textAlign: "center",
            color: "#86868b",
            fontSize: "16px",
            padding: "20px 0"
          }}>
            Cargando preferencias...
          </p>
        ) : preferences.length > 0 ? (
          <ul style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            listStyle: "none",
            padding: "0",
            margin: "0"
          }}>
            {preferences.map((currency, index) => (
              <li key={index} style={{
                backgroundColor: "#f5f5f7",
                padding: "12px 20px", 
                borderRadius: "12px",
                fontWeight: "500",
                color: "#1d1d1f",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                transition: "all 0.2s ease",
                cursor: "default"
              }}>
                {currency}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{
            padding: "24px",
            textAlign: "center",
            color: "#86868b",
            fontSize: "16px",
            backgroundColor: "#f5f5f7",
            borderRadius: "12px"
          }}>
            No sigues ninguna divisa todavía.
          </p>
        )}
      </div>

      {/* Tasas de cambio actuales */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        marginBottom: "40px"
      }}>
        <h2 style={{
          fontSize: "28px",
          fontWeight: "600",
          marginBottom: "24px",
          color: "#1d1d1f",
          letterSpacing: "-0.3px"
        }}>
          Tasas de Cambio Actuales
        </h2>
        
        {loadingRates ? (
          <div style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#86868b"
          }}>
            <div style={{
              display: "inline-block",
              width: "30px",
              height: "30px",
              border: "3px solid rgba(0, 113, 227, 0.2)",
              borderTopColor: "#0071e3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px"
            }} />
            <p style={{ fontSize: "16px", margin: "0" }}>Cargando tasas de cambio...</p>
          </div>
        ) : rates.length > 0 ? (
          <div style={{
            padding: "12px",
            borderRadius: "12px",
            overflow: "hidden"
          }}>
            <IndicatorChart data={rates} timeframe="1D" />
          </div>
        ) : (
          <p style={{
            padding: "24px",
            textAlign: "center",
            color: "#86868b",
            fontSize: "16px",
            backgroundColor: "#f5f5f7",
            borderRadius: "12px"
          }}>
            No hay tasas de cambio disponibles.
          </p>
        )}
      </div>

      {/* Histórico de precios */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        marginBottom: "40px"
      }}>
        <h2 style={{
          fontSize: "28px",
          fontWeight: "600",
          marginBottom: "24px",
          color: "#1d1d1f",
          letterSpacing: "-0.3px"
        }}>
          Histórico de Precios
        </h2>
        
        {preferences.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <label 
              htmlFor="currency-select" 
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "16px",
                fontWeight: "500",
                color: "#1d1d1f"
              }}
            >
              Selecciona una Divisa
            </label>
            <select
              id="currency-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                borderRadius: "12px",
                border: "1px solid #d2d2d7",
                backgroundColor: "#fff",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "16px",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                maxWidth: "400px"
              }}
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
          <div style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#86868b"
          }}>
            <div style={{
              display: "inline-block",
              width: "30px",
              height: "30px",
              border: "3px solid rgba(0, 113, 227, 0.2)",
              borderTopColor: "#0071e3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px"
            }} />
            <p style={{ fontSize: "16px", margin: "0" }}>Cargando historial de {selectedCurrency}...</p>
          </div>
        ) : historicalData.length > 0 ? (
          <div style={{
            padding: "12px",
            borderRadius: "12px",
            overflow: "hidden"
          }}>
            <CandlestickChart data={historicalData} currencyPair={selectedCurrency} />
          </div>
        ) : (
          <p style={{
            padding: "24px",
            textAlign: "center",
            color: "#86868b",
            fontSize: "16px",
            backgroundColor: "#f5f5f7",
            borderRadius: "12px"
          }}>
            No hay datos históricos para {selectedCurrency}.
          </p>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div style={{
          padding: "16px 24px",
          backgroundColor: "#fff1f0",
          border: "1px solid #ffccc7",
          borderRadius: "12px",
          color: "#cf1322",
          fontSize: "16px",
          marginTop: "24px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center"
        }}>
          <svg style={{ marginRight: "12px", minWidth: "24px" }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {/* Estilos CSS globales */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: #fbfbfd;
          }
          
          * {
            box-sizing: border-box;
          }
        `
      }} />
    </div>
  );
};

export default Dashboard;