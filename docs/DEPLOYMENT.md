# Deployment Guide (Render + MongoDB Atlas)

Target architecture:

| Component | Platform | Type |
|---|---|---|
| React frontend | Render | Static Site (root `client`, build `npm install && npm run build`, publish `dist`) |
| Express backend | Render | Web Service (root `server`, build `npm install`, start `npm start`) |
| Database | MongoDB Atlas | M0+ cluster |

> Verify current free-tier limits on both providers before deploying; they change over time.

## 1. MongoDB Atlas

1. Create a project and an M0 (or larger) cluster.
2. Create a database user (least privilege on the `redstocks` database).
3. Network access: restrict to Render's egress IPs where available; avoid 0.0.0.0/0 unless you understand the trade-off.
4. Copy the SRV connection string; you will paste it into Render's environment settings (never into Git).

## 2. Backend (Render Web Service)

1. Push the repository to GitHub.
2. New Web Service → select the repo → Root Directory `server`.
3. Build command `npm install`; start command `npm start`.
4. Environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<atlas connection string>`
   - `JWT_SECRET=<long random string>` (required — startup fails without it)
   - `CLIENT_URL=<your frontend URL>` (CORS allow-list)
   - `STARTING_CASH=100000` (optional)
   - `MARKET_DATA_PROVIDER=demo`
5. Health check path: `/api/v1/health` (the server listens on the platform-provided `PORT`).
6. Deploy, then verify `https://<backend-url>/api/v1/health` returns `"database": "connected"`.

## 3. Frontend (Render Static Site)

1. New Static Site → same repo → Root Directory `client`.
2. Build command `npm install && npm run build`; publish directory `dist`.
3. Environment variable: `VITE_API_BASE_URL=https://<backend-url>/api/v1` (only public config — never secrets).
4. Add an SPA rewrite rule (`/*` → `/index.html`) so deep links like `/stocks/AAPL` survive refresh.

## 4. Production verification checklist

- [ ] Health endpoint returns 200 with database connected.
- [ ] Register a test user; sign in.
- [ ] Search and open a stock; history chart renders with the demo badge.
- [ ] Add/remove a watchlist entry; reload — it persists.
- [ ] Execute a paper buy; portfolio and cash update; transaction appears in history.
- [ ] Inspect the same records in MongoDB Compass via the Atlas string.
- [ ] Check CORS and browser console for errors.
- [ ] Confirm no secret appears in the frontend bundle or repository history.

## 5. Document the real URLs here after deploying

- Frontend: `ADD_DEPLOYED_FRONTEND_URL`
- Backend: `ADD_DEPLOYED_BACKEND_URL`
- Health: `ADD_DEPLOYED_HEALTH_URL`

(Left as placeholders until an actual deployment is performed — per the README, final docs must not carry fake URLs.)
