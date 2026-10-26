# Market Data & Demonstration Mode

## Current provider: `demo`

REDSTOCKS ships with a local demonstration provider (`server/src/services/providers/demoProvider.js`) so the platform works with **zero API keys**. It is explicitly labelled everywhere it appears.

How it works:

- Each symbol is hashed into a seed; prices follow a deterministic seeded random walk (±1.8% daily drift, slight upward bias) over a 400-day window ending today.
- The same symbol produces the same series within a day, the quote equals the last point of the history chart, and ranges (1M/3M/6M/1Y) are slices of one consistent series.
- Volume, day range and 52-week range are derived from the same deterministic walk.
- Every payload includes `source: "demo"`, `asOf`, `generatedAt`, and the disclaimer: *"Demonstration data generated locally by REDSTOCKS. Not real or live market data."*

The UI renders a gold **“Demo data”** badge on every price surface (dashboard, markets table, stock detail, portfolio, watchlist, trade modal). Nothing fabricated is ever presented as live.

## Provider abstraction

`server/src/services/providers/index.js` is the only market-data seam. The interface is:

```js
getQuote(symbol)                       // snapshot incl. previousClose, 52w range, volume
getHistory(symbol, range)              // 1M | 3M | 6M | 1Y daily closes
getCompanyProfile(symbol)
getOverview(symbols)                   // composite, breadth, gainers, losers, mostActive
```

To add a real provider: create `providers/<name>.js` implementing the same four functions (with API key from env vars that stay server-side), register it in the factory, and set `MARKET_DATA_PROVIDER=<name>`. No UI changes are required — but before claiming any data is "live", verify the provider's actual latency and terms (see README §15).

## Selection checklist for a real provider

Before integrating, verify in the provider's current documentation:

- supported exchanges and symbol coverage,
- real-time vs delayed (and how delayed),
- rate limits, authentication and pricing,
- attribution and caching/storage restrictions,
- historical intervals supported.

Do not assume a provider supports a market or real-time quotes without checking.

## Rules this project follows

- Never label fabricated or cached prices as live.
- Show source + timestamp wherever prices appear.
- Simulated order fills always say "simulated/paper trade".
- The news endpoint returns an honest `configured: false` state instead of placeholder headlines.
