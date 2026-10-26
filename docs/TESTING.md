# Testing Report

Test tooling so far: a custom end-to-end HTTP smoke suite (`server/scripts/smoke-test.js`) that boots the real Express app against an in-memory MongoDB and exercises the critical paths. No external database installation is needed to run it.

## How to run

```bash
cd server
npm run smoke
```

## Executed: 2026-10-26 (Node v24.20.0, Windows)

**Result: 29/29 checks passed.** Commands actually run: `npm run smoke`.

Areas covered and verified:

- **Health:** `/health` responds 200 with database/provider status.
- **Auth:** register 201 + token; duplicate email 409; wrong password 401; login 200; `/portfolio` without token 401; role defaults to `user` (no self-assignment).
- **Stocks:** seeded universe ≥ 20 records; quotes labelled `source: "demo"`; search finds AAPL for "appl"; 3M history returns ~90 points labelled demo.
- **Watchlist:** add 201; duplicate 409; list shows the entry.
- **Trade validation:** fractional quantity 400; negative quantity 400; unknown symbol 404.
- **Buy engine:** server-side execution price; cash reduced by the exact transaction value; holdings market value = qty × price; average cost recalculated correctly after a second buy; insufficient cash 422 `INSUFFICIENT_CASH`.
- **Ownership isolation:** user B sees an empty watchlist; user B cannot sell user A's holdings (422).
- **Sell engine:** overselling 422; full sell clears the position; realized P/L equals (sell price − avg cost) × qty; cash restored to the starting balance.
- **History:** 3 transaction records after 2 buys + 1 sell.

## Manual UI verification (executed 2026-10-26)

- `npm run build` — production build succeeds (61 modules, no warnings other than npm script-policy notices).
- Browser walkthrough of the running app: landing page renders; registering through the form signs the user in and provisions $100,000 virtual cash; dashboard shows composite/breadth/movers; a 5-share TSLA buy executed from the stock page appears in Portfolio with cash + holdings reconciling exactly to $100,000; stock detail chart renders with range tabs; all price surfaces show "Demo data" badges.

## Known gaps (honest list)

- No automated unit-test suite yet (planned: Node test runner/Vitest + Supertest for the trade engine edge cases, React Testing Library for UI states — README Phase 13).
- Smoke suite covers happy paths plus the main rejection cases; it does not yet cover concurrent submissions or pagination edges.
- No CI pipeline yet.
- Persistence across restarts is verified only with a real MongoDB instance (local or Atlas); the `dev:memory` helper is intentionally non-persistent.
