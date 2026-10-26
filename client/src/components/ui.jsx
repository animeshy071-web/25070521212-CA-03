import { Link } from 'react-router-dom';
import { fmtCurrency, fmtPct, fmtDate, trendClass } from '../utils/format.js';

/* ---------- Wordmark ---------- */
export function Wordmark({ className = '' }) {
  return (
    <Link to="/" className={`wordmark ${className}`} aria-label="REDSTOCKS home">
      <span className="wm-red">RED</span>
      <span className="wm-rest">STOCKS</span>
      <span className="wm-dot" />
    </Link>
  );
}

/* ---------- Card ---------- */
export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ label, value, sub, children }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {children}
    </div>
  );
}

/* ---------- Trend badge ---------- */
export function Trend({ value, suffix = '%' }) {
  const cls = trendClass(value);
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '—';
  return (
    <span className={`trend ${cls}`}>
      {arrow} {fmtPct(value, { signed: cls !== 'flat' })}
      {suffix === '' ? '' : ''}
    </span>
  );
}

/* ---------- Demo data badge ---------- */
export function DataSourceBadge({ source, asOf, generatedAt }) {
  if (!source) return null;
  const label = source === 'demo' ? 'Demo data' : `${source} data`;
  return (
    <span className="badge badge-demo" title={asOf ? `Price as of ${asOf}` : undefined}>
      ◍ {label}
      {asOf ? ` · ${fmtDate(asOf)}` : ''}
      {generatedAt ? '' : ''}
    </span>
  );
}

/* ---------- Spinner / states ---------- */
export function Spinner() {
  return (
    <div className="center-state" role="status" aria-label="Loading">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="center-state">
      <div className="cs-icon">◈</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="center-state">
      <div className="cs-icon" style={{ color: 'var(--negative)' }}>!</div>
      <h3>Something went wrong</h3>
      <p>{error?.message || 'Unexpected error while loading data.'}</p>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/* ---------- Mover row ---------- */
export function MoverRow({ stock, quote }) {
  return (
    <Link to={`/stocks/${stock.symbol}`} className="mover-row">
      <span className="m-sym">{stock.symbol}</span>
      <span className="m-name">{stock.companyName}</span>
      <span className="m-price">{fmtCurrency(quote.price)}</span>
      <Trend value={quote.changePercent} />
    </Link>
  );
}
