import React, { useState, useEffect } from 'react';
import { updatePreferences } from '../services/api';

const CURRENCY_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound' },
];

const FollowCurrencies = ({ userPreferences, onPreferencesUpdated }) => {
  const initialCurrencies = userPreferences?.preferred_currencies || userPreferences || [];
  const [selectedCurrencies, setSelectedCurrencies] = useState(initialCurrencies);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currenciesArray = userPreferences?.preferred_currencies || userPreferences || [];
    setSelectedCurrencies(currenciesArray);
  }, [userPreferences]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await updatePreferences({
        preferred_currencies: selectedCurrencies,
      });

      // 🔁 Notificar al padre para que actualice datos
      if (onPreferencesUpdated) {
        onPreferencesUpdated(selectedCurrencies);
      }

      alert('✅ Preferencias actualizadas exitosamente');
      console.log('Preferencias actualizadas:', response);
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (currencyPair) => {
    setSelectedCurrencies((prev) =>
      prev.includes(currencyPair)
        ? prev.filter((c) => c !== currencyPair)
        : [...prev, currencyPair]
    );
  };

  const filteredCurrencies = CURRENCY_PAIRS.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-5">
      <div className="card shadow border-0">
        <div className="card-body">
          <h3 className="text-center mb-4">Selecciona los Pares de Divisas que Deseas Seguir</h3>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar par de divisas..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {filteredCurrencies.map((pair) => {
                const isSelected = selectedCurrencies.includes(pair.symbol);
                return (
                  <div className="col-sm-6 col-md-4 mb-3" key={pair.symbol}>
                    <div
                      className={`card currency-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleChange(pair.symbol)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderColor: isSelected ? '#0d6efd' : '#dee2e6',
                        boxShadow: isSelected ? '0 0 10px rgba(13,110,253,0.2)' : 'none',
                      }}
                    >
                      <div className="card-body d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <p className="mb-1 fw-bold">{pair.symbol}</p>
                          <p className="mb-0 text-muted">{pair.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <small className="text-muted">
                {selectedCurrencies.length} pares seleccionados
              </small>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn ${isSubmitting ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Preferencias'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FollowCurrencies;
