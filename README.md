# REDSTOCKS

> Full-stack **paper-trading & market-research platform** — React + Express + MongoDB, wrapped in a dark crimson-and-gold trading UI.

Simulated trading with **virtual money**. Every quote is **clearly-labelled demo data** from a built-in provider — zero API keys, zero real orders, ever.

## Features

- **Markets** — browse 28 seeded US stocks, search by symbol or company, filter by industry, sort, paginated table; stock pages with 1M/3M/6M/1Y charts and key statistics
- **Accounts** — register / login with JWT + bcrypt, profile editing, protected routes
- **Watchlist** — add/remove any stock, duplicate-proof at the database level, persists in MongoDB
- **Paper trading** — buy and sell whole shares with $100,000 virtual cash; prices, fills and balances are computed server-side only; insufficient cash or holdings is rejected with clear errors
- **Portfolio** — live valuation, average cost, realized & unrealized P/L, total return, allocation donut, transaction history
- **Honesty by design** — every price surface carries a "Demo data" badge; the news page reports "provider not configured" instead of inventing headlines

## Quick start

```bash
# 1. API — needs MongoDB via MONGODB_URI (defaults to mongodb://127.0.0.1:27017/redstocks)
cd server && npm install
npm run dev                 # API on :5000 — or `npm run dev:memory` for a zero-install in-memory MongoDB

# 2. UI
cd client && npm install
npm run dev                 # app on :5173

# 3. Utilities
npm run seed                # idempotently upsert the stock universe
npm run smoke               # 29-check end-to-end API suite (needs no MongoDB installation)
```

Health check: `GET http://localhost:5000/api/v1/health` → `{ status, database, marketDataProvider }`

## Architecture

```text
React (Vite SPA)  ──HTTP/JSON + JWT──▶  Express API  ──Mongoose──▶  MongoDB
                                        │
                                        └── provider abstraction ──▶ demo provider (local, deterministic)
```

The frontend never touches the database. Prices, balances and fills are authoritative on the server; the client sends only `{ symbol, quantity }`.

## Verified (2026-10-26, Node 24)

- `npm run smoke` → **29/29 checks passed**: auth flows, user-ownership isolation, trade validation, buy/sell accounting, cent-exact portfolio reconciliation
- `npm run build` → clean production build (61 modules)
- Manual browser walkthrough: register → buy 5 TSLA → portfolio reconciles exactly to $100,000

## Status

| Phases | Scope | Status |
|---|---|---|
| 0–3 | Architecture · scaffold · design system · dashboard | ✅ Complete |
| 4 | MongoDB models, indexes, idempotent seeding | ✅ Complete |
| 5–6 | Demo market data, search, stock pages, charts | ✅ Complete |
| 7–8 | JWT auth, persistent watchlist | ✅ Complete |
| 9–10 | Paper-trading engine, portfolio analytics | ✅ Complete |
| 11 | Market overview, movers, news | 🟡 In progress — overview + movers shipped; news honestly "not configured" |
| 13 · 14 · 16 | Testing · GitHub · documentation | 🟡 In progress |
| 12 · 15 | Administration · deployment (Render + Atlas) | ⬜ Not started |

## Documentation

| Doc | Contents |
|---|---|
| [docs/ROADMAP.md](docs/ROADMAP.md) | Full project plan — all 17 phases, tasks and acceptance criteria |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, data flow, key decisions, security model |
| [docs/API.md](docs/API.md) | Endpoint reference with curl examples |
| [docs/DATABASE.md](docs/DATABASE.md) | Collections, indexes, accounting rules, Compass walkthrough |
| [docs/MARKET_DATA.md](docs/MARKET_DATA.md) | Demo provider internals, real-provider integration guide |
| [docs/TESTING.md](docs/TESTING.md) | Executed test evidence and known gaps |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Render + MongoDB Atlas deployment guide |

## Disclaimer

REDSTOCKS is an educational simulation. Trades use virtual money and demo market data — no brokerage, no real orders, no financial advice.
