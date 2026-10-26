const app = require('./app');
const env = require('./config/env');
const { connectDatabase, dbState } = require('./config/db');
const { seedStocksIfEmpty } = require('./seed/seedStocks');

async function main() {
  let dbConnected = false;
  try {
    await connectDatabase();
    dbConnected = true;
    console.log(`[REDSTOCKS] MongoDB connected (${dbState()}): ${env.mongodbUri.replace(/\/\/.*@/, '//***@')}`);
    await seedStocksIfEmpty();
  } catch (err) {
    console.warn('[REDSTOCKS] MongoDB connection failed:', err.message);
    console.warn('[REDSTOCKS] The API will start in degraded mode. Accounts, watchlists, trading and portfolios are unavailable until MONGODB_URI points at a reachable database.');
  }

  app.listen(env.port, () => {
    console.log(`[REDSTOCKS] API listening on http://localhost:${env.port}/api/v1 (env=${env.nodeEnv}, db=${dbConnected ? 'connected' : 'unavailable'}, provider=${env.marketDataProvider})`);
  });
}

main();
