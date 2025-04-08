import React, { useState } from 'react';
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

const FollowCurrencies = ({ userPreferences }) => {
  const [selectedCurrencies, setSelectedCurrencies] = useState(userPreferences);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePreferences(selectedCurrencies);
      alert('Preferencias actualizadas exitosamente');
    } catch (error) {
      alert('Error al actualizar preferencias');
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
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">Seguimiento de Pares de Divisas</h3>

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
              {filteredCurrencies.map((pair) => (
                <div className="col-md-6 mb-3" key={pair.symbol}>
                  <div
                    className={`card ${selectedCurrencies.includes(pair.symbol) ? 'border-primary bg-light' : ''}`}
                    onClick={() => handleChange(pair.symbol)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="form-check-input me-3"
                        checked={selectedCurrencies.includes(pair.symbol)}
                        onChange={() => {}}
                      />
                      <div>
                        <p className="mb-1 fw-bold">{pair.symbol}</p>
                        <p className="mb-0 text-muted">{pair.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <p className="text-muted">{selectedCurrencies.length} pares seleccionados</p>
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
