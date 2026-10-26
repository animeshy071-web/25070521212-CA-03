/**
 * DEMO market data provider.
 *
 * Generates deterministic, clearly-labelled demonstration data locally so the
 * platform works with zero external API keys. Prices follow a seeded random
 * walk per symbol, so:
 *   - the same symbol always produces the same series for a given day,
 *   - the quote matches the last point of the history chart,
 *   - nothing here is real market data, and every payload says so.
 *
 * Replace with a real provider adapter (same interface) when API keys are
 * available - see docs/MARKET_DATA.md.
 */

const DAY_MS = 86400000;
const WALK_DAYS = 400; // always walk 400 days so quote/history stay consistent

// FNV-1a style string hash -> 32-bit seed
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// One deterministic step of mulberry32
function rand(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function round2(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function normalizeSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function buildDailyCloses(symbol) {
  const sym = normalizeSymbol(symbol);
  const seed = hashString(sym);
  const today = Math.floor(Date.now() / DAY_MS);
  const start = today - (WALK_DAYS - 1);
  let price = 40 + (seed % 380); // 40.00 - 419.99 base
  const points = [];
  for (let day = start; day <= today; day++) {
    // Slight upward drift, +-1.8% daily moves, deterministic per symbol+day
    const r = (rand(seed + day) - 0.48) * 0.036;
    price = Math.max(1, price * (1 + r));
    points.push({
      date: new Date(day * DAY_MS).toISOString().slice(0, 10),
      close: round2(price),
    });
  }
  return points;
}

function getQuote(symbol) {
  const sym = normalizeSymbol(symbol);
  const closes = buildDailyCloses(sym);
  const seed = hashString(sym);
  const today = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  const year = closes.slice(-365);
  let high52 = -Infinity;
  let low52 = Infinity;
  for (const p of year) {
    if (p.close > high52) high52 = p.close;
    if (p.close < low52) low52 = p.close;
  }
  const change = round2(today.close - prev.close);
  const changePercent = round2((today.close / prev.close - 1) * 100);
  const volume = Math.round(1_000_000 + rand(seed + today.date.length + Number(today.date.replace(/-/g, ''))) * 59_000_000);

  return {
    symbol: sym,
    currency: 'USD',
    price: today.close,
    previousClose: prev.close,
    change,
    changePercent,
    dayHigh: round2(today.close * (1 + rand(seed + 1) * 0.012)),
    dayLow: round2(today.close * (1 - rand(seed + 2) * 0.012)),
    open: prev.close,
    fiftyTwoWeekHigh: round2(high52),
    fiftyTwoWeekLow: round2(low52),
    volume,
    source: 'demo',
    asOf: today.date,
    generatedAt: new Date().toISOString(),
    disclaimer: 'Demonstration data generated locally by REDSTOCKS. Not real or live market data.',
  };
}

const RANGE_DAYS = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };

function getHistory(symbol, range = '3M') {
  const days = RANGE_DAYS[range] || RANGE_DAYS['3M'];
  const closes = buildDailyCloses(normalizeSymbol(symbol));
  const points = closes.slice(-days);
  return {
    symbol: normalizeSymbol(symbol),
    range: RANGE_DAYS[range] ? range : '3M',
    interval: '1d',
    points,
    source: 'demo',
    generatedAt: new Date().toISOString(),
    disclaimer: 'Demonstration data generated locally by REDSTOCKS. Not real or live market data.',
  };
}

function getCompanyProfile(symbol) {
  const sym = normalizeSymbol(symbol);
  return { symbol: sym, source: 'demo' };
}

/** Composite + movers across a list of symbols. */
function getOverview(symbols) {
  const quotes = symbols.map((s) => getQuote(s));
  const avgChange = quotes.reduce((acc, q) => acc + q.changePercent, 0) / (quotes.length || 1);
  const compositeLevel = round2(1000 * (1 + avgChange / 100));
  const advancers = quotes.filter((q) => q.changePercent > 0).length;
  const decliners = quotes.filter((q) => q.changePercent < 0).length;
  const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
  return {
    composite: {
      symbol: 'RDX',
      name: 'REDSTOCKS Demo Composite',
      level: compositeLevel,
      changePercent: round2(avgChange),
      source: 'demo',
    },
    breadth: { advancers, decliners, total: quotes.length },
    gainers: sorted.slice(0, 5),
    losers: sorted.slice(-5).reverse(),
    mostActive: [...quotes].sort((a, b) => b.volume - a.volume).slice(0, 5),
    source: 'demo',
    generatedAt: new Date().toISOString(),
    disclaimer: 'Demonstration data generated locally by REDSTOCKS. Not real or live market data.',
  };
}

module.exports = { getQuote, getHistory, getCompanyProfile, getOverview };
