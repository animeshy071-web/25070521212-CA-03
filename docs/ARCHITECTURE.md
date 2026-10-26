# REDSTOCKS Architecture

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5, JavaScript, CSS3 (no UI framework) |
| Routing | React Router v6 |
| Backend | Node.js + Express 4 |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (Bearer) + bcryptjs password hashing |
| Market data | Provider abstraction; `demo` provider implemented (local, deterministic, clearly labelled) |
| Deployment target | Render (static site + web service) + MongoDB Atlas |

## High-level data flow

```text
┌───────────────────────────────────┐
│          React Frontend           │
│ Dashboard, Markets, Charts, Forms │
└─────────────────┬─────────────────┘
                  │ HTTP / JSON  (Authorization: Bearer)
                  ▼
┌───────────────────────────────────┐
│       Node.js + Express API       │
│ Routes → Middleware → Services    │
│ Validation, Auth, Trade engine    │
└──────────┬─────────────────┬──────┘
           │                 │
           ▼                 ▼
┌────────────────────┐  ┌─────────────────────┐
│ MongoDB / Mongoose │  │ Market data provider│
│ Users, Stocks,     │  │ (demo implemented;  │
│ Watchlists,        │  │ real provider slot  │
│ Portfolios,        │  │ ready in providers/)│
│ Holdings, Trades   │  └─────────────────────┘
└────────────────────┘
           ▲
           │ inspection
     MongoDB Compass
```

## Repository layout

```text
client/                React SPA (Vite)
  src/components/      Reusable UI + charts + trade modal
  src/context/         Auth context (token + user session)
  src/hooks/           useApi fetch hook
  src/layouts/         App shell (sidebar + topbar)
  src/pages/           Landing, Dashboard, Markets, StockDetail, Watchlist,
                       Portfolio, Transactions, News, Profile, Login/Register
  src/services/        API client (fetch + token store)
  src/styles/          Design tokens + base/layout/component styles
server/                Express API
  src/config/          Env validation + Mongo connection
  src/controllers/     auth, stocks, watchlist, trades, portfolio, market, users
  src/middleware/      auth (JWT), database guard, error handler
  src/models/          User, Stock, Watchlist, Portfolio, Holding, Transaction
  src/providers →      src/services/providers/  (demo provider + factory)
  src/routes/          /api/v1 route map
  src/seed/            Stock universe + idempotent seeder
  scripts/             dev-memory.js, smoke-test.js
docs/                  Architecture, API, database, market data, testing, deployment
```

## Key decisions

1. **Provider abstraction.** All price data flows through `server/src/services/providers/index.js`. The `demo` provider generates a deterministic seeded random walk per symbol, so quotes, history and the chart always agree and are reproducible. A real provider only needs to implement `getQuote/getHistory/getCompanyProfile/getOverview`.
2. **Server-authoritative finances.** Clients send only `{ symbol, quantity }`. Execution price, transaction value, average cost, realized P/L and balances are computed server-side. There is no endpoint that accepts a price or balance.
3. **Stateless JWT auth.** Tokens are issued on register/login and sent as `Authorization: Bearer`. `requireAuth` re-reads the user from the database on every request, so role changes take effect immediately. Logout is client-side token deletion (documented limitation of stateless JWT).
4. **Consistency strategy.** Trade updates (cash → holding → transaction) run sequentially with pre-checks. Standalone MongoDB does not support multi-document transactions; see docs/DATABASE.md for the documented safe alternative and the replica-set upgrade path.
5. **Honest data labelling.** Every market payload carries `source: 'demo'`, a timestamp and a disclaimer; the UI renders "Demo data" badges on every price surface. See docs/MARKET_DATA.md.
6. **Graceful degradation.** Without MongoDB the API still boots and serves `/api/v1/health`; DB-backed routes return a clean 503 `DATABASE_UNAVAILABLE`.

## Security model

- Passwords hashed with bcrypt (10 rounds); hashes never leave the server.
- Login responses are identical for unknown users and wrong passwords (no account enumeration).
- Rate limiting: 300 req/min per IP on the API, 50 req/15 min on auth endpoints.
- CORS restricted to configured client origins; Helmet security headers; 100 kB JSON body limit.
- Registration cannot set `role`; promotion to `admin` is a manual DB operation.
- All watchlist/portfolio/trade queries are scoped by `user` from the verified JWT, never from the request body.
