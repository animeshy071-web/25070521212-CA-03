/**
 * REDSTOCKS API smoke test.
 *
 * Boots an in-memory MongoDB + the real Express app, then exercises the
 * critical trading and ownership paths end to end over HTTP.
 * Usage: npm run smoke   (no MongoDB installation required)
 */
require('dotenv').config();

const results = [];

function check(name, cond, extra = '') {
  results.push({ name, ok: Boolean(cond) });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : `  -> ${extra}`}`);
}

async function main() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('redstocks');
  process.env.NODE_ENV = 'test';

  const { connectDatabase, mongoose } = require('../src/config/db');
  const { seedStocks } = require('../src/seed/seedStocks');
  await connectDatabase();
  await seedStocks();

  const app = require('../src/app');
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;

  const call = async (method, path, { token, body } = {}) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* no body */ }
    return { status: res.status, json };
  };

  try {
    // ---- health ----
    const health = await call('GET', '/health');
    check('health endpoint responds 200', health.status === 200, JSON.stringify(health.json));

    // ---- auth ----
    const reg = await call('POST', '/auth/register', { body: { name: 'Alice Trader', email: 'alice@example.com', password: 'password123' } });
    check('register returns 201 + token', reg.status === 201 && Boolean(reg.json?.data?.token), JSON.stringify(reg.json));
    const alice = reg.json?.data?.token;

    const dup = await call('POST', '/auth/register', { body: { name: 'Alice Again', email: 'alice@example.com', password: 'password123' } });
    check('duplicate email rejected with 409', dup.status === 409, `got ${dup.status}`);

    const badLogin = await call('POST', '/auth/login', { body: { email: 'alice@example.com', password: 'wrong-password' } });
    check('wrong password rejected with 401', badLogin.status === 401, `got ${badLogin.status}`);

    const goodLogin = await call('POST', '/auth/login', { body: { email: 'alice@example.com', password: 'password123' } });
    check('login returns 200 + token', goodLogin.status === 200 && Boolean(goodLogin.json?.data?.token), `got ${goodLogin.status}`);

    const noAuth = await call('GET', '/portfolio');
    check('portfolio without token rejected with 401', noAuth.status === 401, `got ${noAuth.status}`);

    // ---- stocks ----
    const stocks = await call('GET', '/stocks?limit=100');
    check('stock list returns seeded universe', stocks.status === 200 && stocks.json?.meta?.pagination?.total >= 20, `total=${stocks.json?.meta?.pagination?.total}`);
    check('quotes carry demo source label', stocks.json?.data?.[0]?.quote?.source === 'demo', JSON.stringify(stocks.json?.data?.[0]?.quote?.source));

    const search = await call('GET', '/stocks/search?q=appl');
    check('search finds AAPL for "appl"', search.status === 200 && search.json.data.some((s) => s.symbol === 'AAPL'), JSON.stringify(search.json?.data?.map?.((s) => s.symbol)));

    const history = await call('GET', '/stocks/AAPL/history?range=3M');
    check('history returns ~90 points labelled demo', history.status === 200 && Math.abs(history.json.data.points.length - 90) <= 1 && history.json.data.source === 'demo', `points=${history.json?.data?.points?.length}`);

    // ---- watchlist ----
    const addWl = await call('POST', '/watchlist', { token: alice, body: { symbol: 'AAPL' } });
    check('watchlist add returns 201', addWl.status === 201, JSON.stringify(addWl.json));

    const dupWl = await call('POST', '/watchlist', { token: alice, body: { symbol: 'AAPL' } });
    check('duplicate watchlist entry rejected with 409', dupWl.status === 409, `got ${dupWl.status}`);

    const wl = await call('GET', '/watchlist', { token: alice });
    check('watchlist lists added stock', wl.status === 200 && wl.json.data.length === 1 && wl.json.data[0].stock.symbol === 'AAPL', JSON.stringify(wl.json?.data?.length));

    // ---- trading: validation ----
    const badQty = await call('POST', '/trades/buy', { token: alice, body: { symbol: 'AAPL', quantity: 2.5 } });
    check('fractional quantity rejected with 400', badQty.status === 400 && badQty.json.error.code === 'INVALID_QUANTITY', `got ${badQty.status}`);

    const negQty = await call('POST', '/trades/buy', { token: alice, body: { symbol: 'AAPL', quantity: -5 } });
    check('negative quantity rejected with 400', negQty.status === 400, `got ${negQty.status}`);

    const unknown = await call('POST', '/trades/buy', { token: alice, body: { symbol: 'NOPE', quantity: 5 } });
    check('unknown symbol rejected with 404', unknown.status === 404, `got ${unknown.status}`);

    // ---- trading: buy ----
    const buy1 = await call('POST', '/trades/buy', { token: alice, body: { symbol: 'AAPL', quantity: 10 } });
    const buy1Price = buy1.json?.data?.transaction?.executionPrice;
    check('buy executes with server-side price', buy1.status === 201 && buy1Price > 0, JSON.stringify(buy1.json?.error || buy1Price));

    const snap1 = buy1.json?.data?.portfolio;
    const expectedCash1 = Math.round((100000 - buy1Price * 10) * 100) / 100;
    check('cash reduced by exact transaction value', snap1?.cashBalance === expectedCash1, `cash=${snap1?.cashBalance} expected=${expectedCash1}`);
    check('holdings value matches qty*price', snap1?.holdings?.[0]?.marketValue === Math.round(buy1Price * 10 * 100) / 100, JSON.stringify(snap1?.holdings?.[0]));

    const buy2 = await call('POST', '/trades/buy', { token: alice, body: { symbol: 'AAPL', quantity: 10 } });
    const avg = buy2.json?.data?.portfolio?.holdings?.[0]?.averageCost;
    const expectedAvg = Math.round(((buy1Price * 10 + buy2.json?.data?.transaction?.executionPrice * 10) / 20) * 100) / 100;
    check('average cost recalculated after second buy', avg === expectedAvg, `avg=${avg} expected=${expectedAvg}`);

    const huge = await call('POST', '/trades/buy', { token: alice, body: { symbol: 'AAPL', quantity: 100000 } });
    check('insufficient cash rejected with 422', huge.status === 422 && huge.json.error.code === 'INSUFFICIENT_CASH', `got ${huge.status}`);

    // ---- ownership ----
    const regB = await call('POST', '/auth/register', { body: { name: 'Bob Watcher', email: 'bob@example.com', password: 'password123' } });
    const bob = regB.json?.data?.token;
    const bobWl = await call('GET', '/watchlist', { token: bob });
    check("user B cannot see user A's watchlist", bobWl.status === 200 && bobWl.json.data.length === 0, JSON.stringify(bobWl.json?.data?.length));

    const bobSell = await call('POST', '/trades/sell', { token: bob, body: { symbol: 'AAPL', quantity: 1 } });
    check("user B cannot sell user A's holdings (422)", bobSell.status === 422 && bobSell.json.error.code === 'INSUFFICIENT_HOLDINGS', `got ${bobSell.status}`);

    // ---- trading: sell ----
    const overSell = await call('POST', '/trades/sell', { token: alice, body: { symbol: 'AAPL', quantity: 999 } });
    check('selling more than owned rejected with 422', overSell.status === 422, `got ${overSell.status}`);

    const sell1 = await call('POST', '/trades/sell', { token: alice, body: { symbol: 'AAPL', quantity: 20 } });
    check('sell executes and clears position', sell1.status === 201 && sell1.json.data.portfolio.holdings.length === 0, JSON.stringify(sell1.json?.error));
    const realized = sell1.json?.data?.realizedPL;
    const expectedRealized = Math.round(((sell1.json?.data?.transaction?.executionPrice - avg) * 20) * 100) / 100;
    check('realized P/L = (sell price - avg cost) * qty', realized === expectedRealized, `realized=${realized} expected=${expectedRealized}`);
    check('cash restored after full sell', sell1.json.data.portfolio.cashBalance === 100000, `cash=${sell1.json.data.portfolio.cashBalance}`);

    const trades = await call('GET', '/trades', { token: alice });
    check('transaction history has 3 records', trades.status === 200 && trades.json.meta.pagination.total === 3, `total=${trades.json?.meta?.pagination?.total}`);

    const roleTest = reg.json?.data?.user?.role;
    check('registration cannot self-assign roles (defaults to user)', roleTest === 'user', `role=${roleTest}`);

    // ---- summary ----
    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
    if (failed.length) process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
  }
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
