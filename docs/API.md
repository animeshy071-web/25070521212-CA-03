# REDSTOCKS API Reference

Base URL: `http://localhost:5000/api/v1` (development)

All responses are JSON. Errors use the envelope:

```json
{ "error": { "code": "SOME_CODE", "message": "Human-readable explanation" } }
```

Common codes: `400` validation, `401` missing/invalid token, `403` forbidden, `404` not found, `409` conflict/duplicate, `422` business rule (e.g. insufficient cash), `429` rate limited, `503` database unavailable.

Authenticated endpoints expect `Authorization: Bearer <token>`.

## Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | – | Service status: `{ status, database, marketDataProvider, uptimeSeconds }` |

## Auth

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | – | `{ name, email, password }` | Creates user + virtual portfolio ($100,000 default). Returns `{ token, user }`. |
| POST | `/auth/login` | – | `{ email, password }` | Returns `{ token, user }`. |
| POST | `/auth/logout` | – | – | Informational; the client discards its token. |
| GET | `/auth/me` | ✓ | – | Current user. |

## Stocks (public)

| Method | Endpoint | Query params | Description |
|---|---|---|---|
| GET | `/stocks` | `q, industry, exchange, sort=symbol\|name\|change\|price, page, limit` | Paginated universe with a live demo quote per stock. |
| GET | `/stocks/search` | `q` | Top 8 matches (symbol or company name). |
| GET | `/stocks/:symbol` | – | Metadata + quote + `inWatchlist` (when authenticated). |
| GET | `/stocks/:symbol/quote` | – | Demo quote snapshot. |
| GET | `/stocks/:symbol/history` | `range=1M\|3M\|6M\|1Y` | Daily closes (`{ points: [{ date, close }] }`). |

Every market payload carries `source: "demo"`, `asOf`/`generatedAt` and a disclaimer.

## Watchlist (auth)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/watchlist` | – | Entries with populated stock + quote. |
| POST | `/watchlist` | `{ symbol }` | Adds. `409 ALREADY_WATCHING` on duplicates. |
| DELETE | `/watchlist/:stockId` | – | Removes. |

## Portfolio (auth)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/portfolio` | Full snapshot: cash, holdings value, total value, realized/unrealized P/L, total return %, holdings rows, allocation breakdown. |
| GET | `/portfolio/holdings` | Holdings rows only. |
| GET | `/portfolio/performance` | Metric fields only. |

## Paper trading (auth)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/trades/buy` | `{ symbol, quantity }` | Whole shares 1–100000. Server fetches the price, computes value, checks virtual cash (`422 INSUFFICIENT_CASH`), updates cash + average cost, records the transaction. |
| POST | `/trades/sell` | `{ symbol, quantity }` | Checks holdings (`422 INSUFFICIENT_HOLDINGS`), credits cash, adds realized P/L, removes/decrements the holding. |
| GET | `/trades` | `type=buy\|sell, page, limit` | Transaction history. |
| GET | `/trades/:tradeId` | – | Single transaction (owner only). |

Responses include `meta.simulated: true` and a disclaimer that no real order was placed.

## Market (public)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/market/overview` | Demo composite index, breadth (advancers/decliners), top gainers/losers/most active. |
| GET | `/market/movers` | Gainers/losers/most active only. |
| GET | `/news` | Honest empty state while no news provider is configured. |

## Users (auth)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/users/me` | – | Profile. |
| PATCH | `/users/me` | `{ name }` | Update display name. |

## Example session

```bash
# Register
curl -s -X POST localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Luffy","email":"luffy@example.com","password":"grandline2026"}'
# → {"data":{"token":"eyJ...","user":{...}}}

# Buy 5 shares
curl -s -X POST localhost:5000/api/v1/trades/buy \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"symbol":"TSLA","quantity":5}'
# → {"data":{"transaction":{...},"portfolio":{...}}, "meta":{"simulated":true,...}}
```
