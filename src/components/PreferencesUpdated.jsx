import React, { useState, useEffect } from 'react';
import { getPreferences, fetchRates } from '../services/api';

const CurrencyFollowingList = () => {
  const [followedCurrencies, setFollowedCurrencies] = useState([]);
  const [ratesData, setRatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserPreferences();
    window.addEventListener('preferencesUpdated', handlePreferencesUpdated);
    return () => window.removeEventListener('preferencesUpdated', handlePreferencesUpdated);
  }, []);

  useEffect(() => {
    if (followedCurrencies.length > 0) {
      loadRatesData();
    } else {
      setRatesData([]);
    }
  }, [followedCurrencies]);

  const handlePreferencesUpdated = (event) => {
    if (event.detail?.preferred_currencies) {
      setFollowedCurrencies(event.detail.preferred_currencies);
    }
  };

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await getPreferences();
      setFollowedCurrencies(preferences.preferred_currencies || []);
    } catch (err) {
      setError('No se pudieron cargar las preferencias.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRatesData = async () => {
    try {
      setLoading(true);
      const data = await fetchRates(followedCurrencies);
      setRatesData(data);
    } catch (err) {
      setError('No se pudieron cargar las tasas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRatesData();
  };

  const renderRateCard = (pair) => {
    const { base, counter } = getCurrenciesFromPair(pair);
    const rate = getLatestRate(ratesData, { base, counter });

    return (
      <div key={pair} className="card mb-3 shadow-sm border-0">
        <div className="card-body d-flex flex-column gap-2">
          <h5 className="card-title mb-1 text-primary fw-bold">{pair}</h5>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Tasa actual:</span>
            <span className="fs-5 fw-semibold text-success">
              {rate}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="currency-following-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="section-title mb-0">Divisas que sigues:</h2>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={handleRefresh}
          disabled={loading || followedCurrencies.length === 0}
        >
          {loading ? 'Actualizando...' : 'Actualizar tasas'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger text-center">{error}</div>
      )}

      {loading && followedCurrencies.length === 0 ? (
        <div className="text-center text-muted">Cargando preferencias...</div>
      ) : followedCurrencies.length === 0 ? (
        <p className="text-muted fst-italic text-center">
          No estás siguiendo ninguna divisa.
        </p>
      ) : (
        <div className="currency-list">{followedCurrencies.map(renderRateCard)}</div>
      )}
    </div>
  );
};

// Auxiliares
const getCurrenciesFromPair = (pair) => {
  const [base, counter] = pair.split('/');
  return { base, counter };
};

const getLatestRate = (ratesData, { base, counter }) => {
  if (!ratesData?.length) return '...';

  const baseData = ratesData.find((item) => item.currency === base);
  const counterData = ratesData.find((item) => item.currency === counter);

  if (!baseData || !counterData) return 'N/A';

  if (base !== 'USD' && counter !== 'USD') {
    const baseToUsd = 1 / baseData.value;
    const counterToUsd = 1 / counterData.value;
    return (baseToUsd / counterToUsd).toFixed(4);
  } else if (base === 'USD') {
    return counterData.value.toFixed(4);
  } else {
    return (1 / baseData.value).toFixed(4);
  }
};

export default CurrencyFollowingList;
