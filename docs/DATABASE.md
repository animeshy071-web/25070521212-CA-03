# REDSTOCKS Database Design

MongoDB via Mongoose 8. Default local URI: `mongodb://127.0.0.1:27017/redstocks` (set `MONGODB_URI`; Atlas strings work unchanged).

## Collections

### users
`name` (2–80 chars), `email` (unique, lowercased, regex-validated), `passwordHash` (bcrypt, 10 rounds, removed from JSON output), `role` (`user`|`admin`, default `user` — never settable from public endpoints), timestamps.

### stocks
`symbol` (unique, uppercase), `companyName`, `exchange`, `industry`, `market`, `currency`, `description`, `isDemoSeed`, timestamps. Seeded idempotently from `server/src/seed/stockUniverse.js` (28 US mega-caps) on boot if the collection is empty; `npm run seed` upserts manually.

### watchlists
`user` → User, `stock` → Stock, timestamps.
**Unique index `{ user, stock }`** — duplicates are impossible at the database level (also pre-checked for a friendly 409).

### portfolios
`user` (unique) → User, `cashBalance` (min 0), `startingBalance`, `currency`, `realizedPL`, timestamps. Created automatically at registration (and lazily on first access). The client can never write balances.

### holdings
`user` → User, `stock` → Stock, `quantity` (integer ≥ 1 — whole shares only), `averageCost` (> 0), timestamps.
**Unique index `{ user, stock }`.** Average cost updates on buys: `newAvg = (avgCost·qty + buyValue) / (qty + buyQty)`; unchanged on partial sells; the holding is deleted when quantity reaches 0.

### transactions
`user`, `stock`, `type` (`buy`|`sell`), `quantity` (integer), `executionPrice`, `transactionValue`, `fees` (0 — see accounting rules), `status` (`executed`), `marketDataSource`, `marketDataTimestamp`, timestamps. Index `{ user, createdAt: -1 }`.

## Accounting rules (authoritative, server-side)

- **Whole shares only.** Fractional quantities are rejected with `400 INVALID_QUANTITY`.
- **Fees: 0** (simple model; documented rather than hidden).
- **Execution price** = the provider snapshot at order time; the client cannot supply one.
- **Buy:** `cash -= value`, holding upserted with recalculated average cost.
- **Sell:** realized P/L `= (sellPrice − avgCost) × qty`, added to `portfolio.realizedPL`; `cash += value`.
- Money values are rounded to 2 decimals at every write (`round2`).

## Consistency strategy

Cash, holding and transaction writes run sequentially with pre-validation. Standalone MongoDB (the common local setup) does not support multi-document transactions, so instead of pretending they exist:

- each step validates before writing,
- the portfolio snapshot shown to users is always **recomputed** from holdings + cash, so display never drifts from stored state,
- the transaction record is written last, so it reflects committed changes.

**Upgrade path:** on a replica set (e.g. Atlas), wrap the three writes in `mongoose.startSession()/withTransaction` inside `tradeController` — the code is structured so this is a contained change. This limitation is also listed in [ROADMAP.md §21](ROADMAP.md).

## Seeding

- `npm run seed` — upserts the stock universe (safe to re-run, never deletes).
- On boot, if the `stocks` collection is empty, the server seeds it automatically.
- Destructive seeding does not exist, so production data cannot be erased by re-seeding.

## Verifying in MongoDB Compass

1. Connect to `mongodb://127.0.0.1:27017/redstocks` (or your Atlas string).
2. Register a user in the app → inspect `users` (note `passwordHash` is a bcrypt digest).
3. Add a watchlist entry → `watchlists` gains a document.
4. Place a paper trade → inspect `transactions`, `holdings`, `portfolios`.
5. Restart the API and sign in again — everything persists (with a real MongoDB instance; the dev `dev:memory` helper is intentionally non-persistent).
