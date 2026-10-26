const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numCompact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const fmtCurrency = (v) => usd.format(v ?? 0);
export const fmtCurrencyCompact = (v) => usdCompact.format(v ?? 0);
export const fmtCompact = (v) => numCompact.format(v ?? 0);

export function fmtPct(v, { signed = true } = {}) {
  const n = v ?? 0;
  const sign = signed && n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function fmtDate(iso, { withTime = false } = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  if (withTime) opts.hour = '2-digit', opts.minute = '2-digit';
  return d.toLocaleString('en-US', opts);
}

export const trendClass = (v) => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat');
export const initials = (name = '') => name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
