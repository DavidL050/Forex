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
  const [predictions, setPredictions] = useState({});
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [predictionTimeframe, setPredictionTimeframe] = useState("1W");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setError(""); 
    try {
      const preferencesData = await getPreferences();
      const preferred = preferencesData.preferred_currencies || [];
      setPreferences(preferred);
      setSelectedCurrency(preferred[0] || "");
      setLoadingPreferences(false);

      if (preferred.length > 0) {
        const ratesData = await fetchRates(preferred);
        setRates(ratesData);
      } else {
        setRates([]);
      }
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
    } else {
      setHistoricalData([]);
      setPredictions({});
    }
  }, [selectedCurrency]);

  const loadHistory = async (currency) => {
    setLoadingHistory(true);
    setHistoricalData([]);
    setPredictions({});
    setError(""); 
    try {
      const data = await fetchHistory(currency);
      // console.log("Estructura del primer dato histórico:", data && data.length > 0 ? data[0] : "No hay datos históricos.");
      setHistoricalData(data);
      if (data && data.length > 0) {
        generatePredictions(currency, data);
      } else {
        setPredictions({});
        console.log("No se recibieron datos históricos para", currency);
      }
    } catch (err) {
      console.error("Error al obtener historial:", err);
      setError(`Error al obtener historial para ${currency}: ${err.message}`);
      setPredictions({}); 
    } finally {
      setLoadingHistory(false);
    }
  };

  const generatePredictions = async (currency, historicalDataInput) => {
    if (!historicalDataInput || historicalDataInput.length === 0) {
      console.error("No hay datos históricos disponibles para la predicción.");
      setPredictions({});
      setLoadingPredictions(false);
      return;
    }

    setLoadingPredictions(true);
    setError(""); 
    try {
      const lastFiveDays = historicalDataInput.slice(-5);
      
      if (!lastFiveDays || lastFiveDays.length === 0 || !lastFiveDays[lastFiveDays.length - 1]) {
        console.error("Datos históricos insuficientes o inválidos para predicción después de slice.");
        setPredictions({});
        setLoadingPredictions(false);
        return;
      }
      
      // ***** CORRECCIÓN AQUÍ *****
      const lastPrice = lastFiveDays[lastFiveDays.length - 1].c; // Usar .c para el precio de cierre
      
      if (typeof lastPrice !== 'number' || isNaN(lastPrice)) {
        console.error("El último precio no es un número válido:", lastPrice, "Objeto completo:", lastFiveDays[lastFiveDays.length - 1]);
        setPredictions({});
        setLoadingPredictions(false);
        setError(`No se pudo obtener el último precio válido para ${currency}. Verifica la estructura de los datos históricos.`);
        return;
      }

      const volatility = calculateVolatility(lastFiveDays);
      const trend = calculateTrend(lastFiveDays);
      
      const predictionData = {
        currency,
        volatility,
        trend,
        predictions: {
          "1D": {
            min: +(lastPrice * (1 - volatility * 0.3)).toFixed(4),
            max: +(lastPrice * (1 + volatility * 0.3)).toFixed(4),
            prediction: +(lastPrice * (1 + trend * 0.2)).toFixed(4),
            confidence: Math.max(0, Math.min(95 - volatility * 100, 85)).toFixed(1)
          },
          "1W": {
            min: +(lastPrice * (1 - volatility * 0.7)).toFixed(4),
            max: +(lastPrice * (1 + volatility * 0.8)).toFixed(4),
            prediction: +(lastPrice * (1 + trend * 0.5)).toFixed(4),
            confidence: Math.max(0, Math.min(90 - volatility * 120, 80)).toFixed(1)
          },
          "1M": {
            min: +(lastPrice * (1 - volatility * 1.5)).toFixed(4),
            max: +(lastPrice * (1 + volatility * 1.8)).toFixed(4),
            prediction: +(lastPrice * (1 + trend * 1.2)).toFixed(4),
            confidence: Math.max(0, Math.min(80 - volatility * 150, 70)).toFixed(1)
          }
        },
        recommendedAction: getRecommendedAction(trend, volatility),
        riskLevel: getRiskLevel(volatility),
        lastUpdated: new Date().toLocaleString()
      };
      
      setPredictions(predictionData);
    } catch (err) {
      console.error("Error al generar predicciones:", err);
      setError(`Error al generar predicciones para ${currency}: ${err.message || "Error desconocido"}`);
      setPredictions({});
    } finally {
      setLoadingPredictions(false);
    }
  };
  
  const calculateVolatility = (data) => {
    if (!data || data.length < 2) return 0.05;
    
    const ranges = data.map(d => {
      // ***** CORRECCIÓN AQUÍ *****
      if (d && typeof d.h === 'number' && typeof d.l === 'number' && d.l !== 0) { // Usar .h y .l
        return (d.h - d.l) / d.l;
      }
      return 0;
    }).filter(r => r > 0);

    if (ranges.length === 0) return 0.05;

    const avgRange = ranges.reduce((sum, val) => sum + val, 0) / ranges.length;
    return Math.min(Math.max(avgRange, 0.01), 0.2);
  };
  
  const calculateTrend = (data) => {
    if (!data || data.length < 2) return 0;
    
    // ***** CORRECCIÓN AQUÍ *****
    const firstClose = data[0]?.c; // Usar .c
    const lastClose = data[data.length - 1]?.c; // Usar .c

    if (typeof firstClose !== 'number' || typeof lastClose !== 'number' || firstClose === 0) {
      console.warn("No se pudo calcular la tendencia, datos de cierre inválidos:", data[0], data[data.length-1]);
      return 0;
    }
    
    return (lastClose - firstClose) / firstClose;
  };
  
  const getRecommendedAction = (trend, volatility) => {
    if (trend > 0.03) return "COMPRAR";
    if (trend < -0.03) return "VENDER";
    if (trend > 0.01 && volatility < 0.08) return "ACUMULAR";
    if (trend < -0.01 && volatility < 0.08) return "REDUCIR";
    return "MANTENER";
  };
  
  const getRiskLevel = (volatility) => {
    if (volatility > 0.15) return "ALTO";
    if (volatility > 0.08) return "MEDIO";
    return "BAJO";
  };

  const handleTimeframeChange = (timeframe) => {
    setPredictionTimeframe(timeframe);
  };

  const handleRefresh = async () => {
    setLoadingRates(true);
    setLoadingPreferences(true);
    setError("");
    try {
      const preferencesData = await getPreferences();
      const updatedPreferences = preferencesData.preferred_currencies || [];
      setPreferences(updatedPreferences);
      
      if (updatedPreferences.length === 0) {
        setSelectedCurrency("");
        setRates([]); 
        setHistoricalData([]); 
        setPredictions({}); 
      } else if (!updatedPreferences.includes(selectedCurrency)) {
        setSelectedCurrency(updatedPreferences[0]); 
      } else {
        if (selectedCurrency) {
            await loadHistory(selectedCurrency); 
        }
      }
      
      if (updatedPreferences.length > 0) {
        const updatedRates = await fetchRates(updatedPreferences);
        setRates(updatedRates);
      } else {
        setRates([]);
      }

    } catch (err) {
      console.error("Error al refrescar:", err);
      setError(`Error al refrescar: ${err.message || "Error desconocido"}`);
    } finally {
      setLoadingRates(false);
      setLoadingPreferences(false);
    }
  };

  const spinnerStyle = {
    display: "inline-block",
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "12px"
  };

  const largeSpinnerStyle = {
    display: "inline-block",
    width: "30px",
    height: "30px",
    border: "3px solid rgba(0, 113, 227, 0.2)",
    borderTopColor: "#0071e3",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px"
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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

      {error && (
        <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            border: "1px solid #e57373"
        }}>
            <strong>Error:</strong> {error}
            <button 
                onClick={() => setError("")} 
                style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #c62828', borderRadius: '4px', backgroundColor: 'transparent', color: '#c62828'}}
            >
                Descartar
            </button>
        </div>
      )}

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
          onPreferencesChanged={loadDashboardData} 
        />

        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "32px",
          marginBottom: "32px"
        }}>
          <button
            onClick={handleRefresh}
            disabled={loadingRates || loadingPreferences || loadingHistory || loadingPredictions}
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
              cursor: (loadingRates || loadingPreferences || loadingHistory || loadingPredictions) ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 10px rgba(0, 113, 227, 0.3)",
              minWidth: "180px",
              height: "45px",
              opacity: (loadingRates || loadingPreferences || loadingHistory || loadingPredictions) ? "0.7" : "1"
            }}
          >
            {(loadingRates || loadingPreferences || loadingHistory || loadingPredictions) ? (
              <>
                <span style={spinnerStyle} />
                Actualizando...
              </>
            ) : (
              "Actualizar Todo"
            )}
          </button>
        </div>

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
          <p style={{ textAlign: "center", color: "#86868b", fontSize: "16px", padding: "20px 0" }}>
            <span style={{...largeSpinnerStyle, borderTopColor: '#86868b', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent', width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle'}} />
            Cargando preferencias...
          </p>
        ) : preferences.length > 0 ? (
          <ul style={{ display: "flex", flexWrap: "wrap", gap: "12px", listStyle: "none", padding: "0", margin: "0" }}>
            {preferences.map((currency) => (
              <li key={currency} style={{ backgroundColor: "#f5f5f7", padding: "12px 20px", borderRadius: "12px", fontWeight: "500", color: "#1d1d1f", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)", transition: "all 0.2s ease", cursor: "default" }}>
                {currency}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ padding: "24px", textAlign: "center", color: "#86868b", fontSize: "16px", backgroundColor: "#f5f5f7", borderRadius: "12px" }}>
            No sigues ninguna divisa todavía. Añade algunas para empezar.
          </p>
        )}
      </div>

      {/* Tasas de cambio actuales */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "24px", color: "#1d1d1f", letterSpacing: "-0.3px" }}>
          Tasas de Cambio Actuales
        </h2>
        
        {loadingRates ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#86868b" }}>
            <div style={largeSpinnerStyle} />
            <p style={{ fontSize: "16px", margin: "0" }}>Cargando tasas de cambio...</p>
          </div>
        ) : rates.length > 0 ? (
          <div style={{ padding: "12px", borderRadius: "12px", overflow: "hidden" }}>
            <IndicatorChart data={rates} timeframe="1D" />
          </div>
        ) : (
          <p style={{ padding: "24px", textAlign: "center", color: "#86868b", fontSize: "16px", backgroundColor: "#f5f5f7", borderRadius: "12px" }}>
            {preferences.length === 0 ? "Añade divisas para ver sus tasas." : "No hay tasas de cambio disponibles."}
          </p>
        )}
      </div>

      {/* Histórico de precios */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "24px", color: "#1d1d1f", letterSpacing: "-0.3px" }}>
          Histórico de Precios
        </h2>
        
        {preferences.length > 0 && !loadingPreferences ? (
          <div style={{ marginBottom: "28px" }}>
            <label htmlFor="currency-select" style={{ display: "block", marginBottom: "8px", fontSize: "16px", fontWeight: "500", color: "#1d1d1f" }}>
              Selecciona una Divisa
            </label>
            <select
              id="currency-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              disabled={loadingHistory || loadingPredictions}
              style={{ width: "100%", padding: "12px 16px", fontSize: "16px", borderRadius: "12px", border: "1px solid #d2d2d7", backgroundColor: "#fff", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000000' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px", cursor: (loadingHistory || loadingPredictions) ? "not-allowed" : "pointer", transition: "border-color 0.2s ease", maxWidth: "400px" }}
            >
              {preferences.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        ) : loadingPreferences ? (
          <p style={{ color: "#86868b", fontSize: "16px"}}>Cargando lista de divisas...</p>
        ) : (
           <p style={{ padding: "24px 0", textAlign: "center", color: "#86868b", fontSize: "16px" }}>
            Añade divisas a tu lista de seguimiento para ver su historial.
          </p>
        )}

        {selectedCurrency && loadingHistory ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#86868b" }}>
            <div style={largeSpinnerStyle} />
            <p style={{ fontSize: "16px", margin: "0" }}>Cargando historial de {selectedCurrency}...</p>
          </div>
        ) : selectedCurrency && historicalData.length > 0 ? (
          <div style={{ padding: "12px", borderRadius: "12px", overflow: "hidden" }}>
            <CandlestickChart data={historicalData} currencyPair={selectedCurrency} />
          </div>
        ) : selectedCurrency && !loadingHistory && historicalData.length === 0 ? (
          <p style={{ padding: "24px", textAlign: "center", color: "#86868b", fontSize: "16px", backgroundColor: "#f5f5f7", borderRadius: "12px" }}>
            No hay datos históricos disponibles para {selectedCurrency}.
          </p>
        ) : !selectedCurrency && !loadingPreferences && preferences.length > 0 ? ( 
           <p style={{ padding: "24px", textAlign: "center", color: "#86868b", fontSize: "16px", backgroundColor: "#f5f5f7", borderRadius: "12px" }}>
            Selecciona una divisa de tu lista para ver su historial.
           </p>
        ) : null }
      </div>

      {/* Predicciones de Divisas */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "24px", color: "#1d1d1f", letterSpacing: "-0.3px", display: "flex", alignItems: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "12px" }}>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          Predicciones IA
        </h2>

        {!selectedCurrency && !loadingPreferences && preferences.length > 0 ? (
          <p style={{ padding: "24px", textAlign: "center", color: "#86868b", fontSize: "16px", backgroundColor: "#f5f5f7", borderRadius: "12px" }}>
            Selecciona una divisa para ver sus predicciones.
          </p>
        ) : selectedCurrency && loadingPredictions ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#86868b" }}>
            <div style={largeSpinnerStyle} />
            <p style={{ fontSize: "16px", margin: "0" }}>Analizando datos y generando predicciones para {selectedCurrency}...</p>
          </div>
        ) : selectedCurrency && Object.keys(predictions).length > 0 && predictions.predictions && predictions.predictions[predictionTimeframe] ? (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", backgroundColor: "#f5f5f7", borderRadius: "12px", padding: "4px", maxWidth: "400px" }}>
                {["1D", "1W", "1M"].map(timeframe => (
                  <button
                    key={timeframe}
                    onClick={() => handleTimeframeChange(timeframe)}
                    disabled={loadingPredictions}
                    style={{ flex: 1, padding: "10px 16px", backgroundColor: predictionTimeframe === timeframe ? "#0071e3" : "transparent", color: predictionTimeframe === timeframe ? "white" : "#1d1d1f", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", cursor: loadingPredictions ? "not-allowed" : "pointer", transition: "all 0.2s ease" }}
                  >
                    {timeframe === "1D" ? "1 Día" : timeframe === "1W" ? "1 Semana" : "1 Mes"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: "#f0f7ff", borderRadius: "16px", padding: "24px", marginBottom: "24px", border: "1px solid #d1e5ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "22px", fontWeight: "600", margin: "0 0 4px 0", color: "#1d1d1f" }}>
                    {selectedCurrency}
                  </h3>
                  <p style={{ margin: "0", fontSize: "14px", color: "#6e6e73" }}>
                    Última actualización: {predictions.lastUpdated}
                  </p>
                </div>
                <div style={{ padding: "8px 16px", backgroundColor: predictions.recommendedAction === "COMPRAR" ? "#e3f5e9" : predictions.recommendedAction === "VENDER" ? "#feeced" : "#f5f5f7", color: predictions.recommendedAction === "COMPRAR" ? "#107c41" : predictions.recommendedAction === "VENDER" ? "#d90429" : "#1d1d1f", borderRadius: "20px", fontWeight: "600", fontSize: "14px" }}>
                  {predictions.recommendedAction}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6e6e73" }}>
                    Precio Estimado ({predictionTimeframe})
                  </p>
                  <h4 style={{ margin: "0", fontSize: "24px", fontWeight: "700", color: "#1d1d1f" }}>
                    {predictions.predictions[predictionTimeframe].prediction}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", marginTop: "8px", fontSize: "13px", color: "#6e6e73" }}>
                    <div style={{ padding: "3px 8px", backgroundColor: parseFloat(predictions.predictions[predictionTimeframe].confidence) > 70 ? "#e3f5e9" : (parseFloat(predictions.predictions[predictionTimeframe].confidence) > 40 ? "#fff3e0" : "#feeced"), color: parseFloat(predictions.predictions[predictionTimeframe].confidence) > 70 ? "#107c41" : (parseFloat(predictions.predictions[predictionTimeframe].confidence) > 40 ? "#ef6c00" : "#d90429"), borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}>
                      {predictions.predictions[predictionTimeframe].confidence}% conf.
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6e6e73" }}>
                    Rango de Precios ({predictionTimeframe})
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#1d1d1f" }}>
                      {predictions.predictions[predictionTimeframe].min}
                    </span>
                    <span style={{ fontSize: "14px", color: "#6e6e73" }}>a</span>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#1d1d1f" }}>
                      {predictions.predictions[predictionTimeframe].max}
                    </span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "#e0e0e0", borderRadius: "3px", marginTop: "12px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: `${Math.max(0, Math.min(100, ((predictions.predictions[predictionTimeframe].prediction - predictions.predictions[predictionTimeframe].min) / (predictions.predictions[predictionTimeframe].max - predictions.predictions[predictionTimeframe].min) * 100) - 5))}%`, width: "10%", height: "100%", backgroundColor: "#0071e3", borderRadius: "3px", minWidth: "2px" }} />
                  </div>
                </div>

                <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6e6e73" }}>
                    Factores Clave
                  </p>
                  <div style={{ fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Tendencia (5D):</span>
                      <span style={{ color: predictions.trend > 0.005 ? "#107c41" : predictions.trend < -0.005 ? "#d90429" : "#6e6e73", fontWeight: "500" }}>
                        {(predictions.trend * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Volatilidad (5D):</span>
                      <span style={{ color: predictions.riskLevel === "BAJO" ? "#107c41" : predictions.riskLevel === "ALTO" ? "#d90429" : "#f7b955", fontWeight: "500" }}>
                        {predictions.riskLevel} ({(predictions.volatility*100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#1d1d1f" }}>
                  Análisis y Recomendación
                </h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "15px", lineHeight: "1.6", color: "#424245" }}>
                  {
                    predictions.recommendedAction === "COMPRAR" ? 
                      `El análisis de patrones muestra una fuerte tendencia alcista para ${selectedCurrency} con volatilidad ${predictions.riskLevel.toLowerCase()} relativa. Los indicadores técnicos sugieren un momento favorable para incrementar posiciones considerando un horizonte de ${predictionTimeframe === "1D" ? "corto" : predictionTimeframe === "1W" ? "medio" : "largo"} plazo.` :
                    predictions.recommendedAction === "VENDER" ?
                      `El modelo detecta señales de agotamiento en la tendencia actual de ${selectedCurrency}, con alta probabilidad de reversión. La volatilidad ${predictions.riskLevel.toLowerCase()} (${(predictions.volatility*100).toFixed(1)}%) sugiere un riesgo incremental, por lo que se recomienda reducir exposición en el ${predictionTimeframe === "1D" ? "corto" : predictionTimeframe === "1W" ? "medio" : "largo"} plazo.` :
                    predictions.recommendedAction === "ACUMULAR" ?
                      `Los indicadores muestran una tendencia positiva gradual para ${selectedCurrency}. Con volatilidad ${predictions.riskLevel.toLowerCase()} y señales de soporte consistentes, se recomienda una estrategia de acumulación progresiva aprovechando posibles retrocesos menores en el ${predictionTimeframe === "1D" ? "corto" : predictionTimeframe === "1W" ? "medio" : "largo"} plazo.` :
                    predictions.recommendedAction === "REDUCIR" ?
                      `El análisis sugiere una fase de consolidación negativa para ${selectedCurrency}. Aunque la volatilidad es ${predictions.riskLevel.toLowerCase()}, los patrones técnicos indican una probable continuación de la tendencia bajista en el ${predictionTimeframe === "1D" ? "corto" : predictionTimeframe === "1W" ? "medio" : "largo"} plazo.` :
                      `El modelo detecta una fase de consolidación para ${selectedCurrency} con señales mixtas. La volatilidad actual del ${(predictions.volatility * 100).toFixed(1)}% (${predictions.riskLevel}) sugiere mantener las posiciones actuales y esperar clarificación de tendencia antes de nuevos movimientos en el mercado para el ${predictionTimeframe === "1D" ? "corto" : predictionTimeframe === "1W" ? "medio" : "largo"} plazo.`
                  }
                </p>
              </div>
            </div>
          </div>
        ) : selectedCurrency && !loadingHistory && !loadingPredictions && historicalData.length > 0 ? ( 
           <p style={{ padding: "24px", textAlign: "center", color: "#86868b", fontSize: "16px", backgroundColor: "#f5f5f7", borderRadius: "12px" }}>
            No se pudieron generar predicciones para {selectedCurrency} en este momento.
            {error && ` Detalle: ${error}`} 
          </p>
        ) : selectedCurrency && !loadingHistory && !loadingPredictions && historicalData.length === 0 ? ( 
             <p style={{ padding: "24px", textAlign: "center", color: "#86868b", fontSize: "16px", backgroundColor: "#f5f5f7", borderRadius: "12px" }}>
               No hay datos históricos para {selectedCurrency}, por lo tanto no se pueden generar predicciones.
             </p>
        ) : null }
      </div>
    </div>
  );
};

export default Dashboard;