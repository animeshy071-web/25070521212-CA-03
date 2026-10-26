const Stock = require('../models/Stock');
const { STOCK_UNIVERSE } = require('./stockUniverse');

/**
 * Idempotent seeding: upserts every universe stock by symbol. Never deletes
 * existing records, so it is always safe to re-run (including on boot).
 */
async function seedStocks() {
  let upserted = 0;
  for (const item of STOCK_UNIVERSE) {
    await Stock.updateOne(
      { symbol: item.symbol },
      { $set: { ...item, market: 'US', currency: 'USD', isDemoSeed: true } },
      { upsert: true },
    );
    upserted += 1;
  }
  return upserted;
}

async function seedStocksIfEmpty() {
  const count = await Stock.countDocuments();
  if (count === 0) {
    const n = await seedStocks();
    console.log(`[REDSTOCKS] Seeded ${n} demo stocks (collection was empty).`);
    return n;
  }
  return 0;
}

module.exports = { seedStocks, seedStocksIfEmpty };
