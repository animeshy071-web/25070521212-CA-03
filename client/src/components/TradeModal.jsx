import { useState } from 'react';
import { api } from '../services/api.js';
import { fmtCurrency } from '../utils/format.js';
import { IconClose } from './icons.jsx';

/**
 * Buy/sell modal for paper trading.
 * mode: 'buy' | 'sell'; stock: {_id, symbol, companyName}; quote: {price, source};
 * maxQuantity: owned shares (sell) or null (buy).
 */
export default function TradeModal({ mode, stock, quote, maxQuantity, cashBalance, onClose, onDone }) {
  const [quantity, setQuantity] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const qty = Number(quantity);
  const validQty = Number.isInteger(qty) && qty >= 1;
  const value = validQty ? Math.round(quote.price * qty * 100) / 100 : 0;

  const tooExpensive = mode === 'buy' && validQty && cashBalance != null && value > cashBalance;
  const tooMany = mode === 'sell' && validQty && maxQuantity != null && qty > maxQuantity;
  const canSubmit = validQty && !busy && !tooExpensive && !tooMany;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const d = await api.post(`/trades/${mode}`, { symbol: stock.symbol, quantity: qty });
      setSuccess(d.data.transaction);
      setTimeout(() => onDone(), 1400);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${mode} ${stock.symbol}`}>
        <div className="modal-head">
          <h3>
            <span className={`type-badge ${mode}`}>{mode === 'buy' ? 'Buy' : 'Sell'}</span> {stock.symbol}
            <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {stock.companyName}</span>
          </h3>
          <button className="mh-x" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {success ? (
          <div className="alert alert-success">
            Simulated {mode} of {success.quantity} {stock.symbol} @ {fmtCurrency(success.executionPrice)} executed. This was a paper trade - no real order was placed.
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="data-meta" style={{ marginBottom: 12 }}>
              <span className="badge badge-demo">◍ Demo quote</span>
              <span>Price: <strong>{fmtCurrency(quote.price)}</strong></span>
            </div>

            <div className="field">
              <label htmlFor="trade-qty">Quantity (whole shares)</label>
              <input
                id="trade-qty"
                className="input"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="e.g. 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                autoFocus
              />
            </div>

            <div className="trade-summary">
              <div className="ts-row"><span>Estimated {mode === 'buy' ? 'cost' : 'proceeds'}</span><span className="num">{validQty ? fmtCurrency(value) : '—'}</span></div>
              {mode === 'buy' && cashBalance != null && (
                <div className="ts-row"><span>Virtual cash available</span><span className="num">{fmtCurrency(cashBalance)}</span></div>
              )}
              {mode === 'sell' && maxQuantity != null && (
                <div className="ts-row"><span>Shares owned</span><span className="num">{maxQuantity}</span></div>
              )}
            </div>

            {tooExpensive && <div className="alert alert-error" style={{ marginBottom: 12 }}>Not enough virtual cash for this quantity.</div>}
            {tooMany && <div className="alert alert-error" style={{ marginBottom: 12 }}>You only own {maxQuantity} share(s) of {stock.symbol}.</div>}
            {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

            <button className={`btn btn-block btn-lg ${mode === 'buy' ? 'btn-primary' : 'btn-blue'}`} disabled={!canSubmit}>
              {busy ? 'Placing simulated order…' : `Confirm ${mode === 'buy' ? 'buy' : 'sell'} (paper trade)`}
            </button>
            <p style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
              Simulation only - uses demo market data. No real order reaches any exchange.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
