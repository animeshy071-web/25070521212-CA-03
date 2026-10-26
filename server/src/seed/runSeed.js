/* Standalone seed runner: `npm run seed` */
const { connectDatabase } = require('../config/db');
const { seedStocks } = require('./seedStocks');
const { mongoose } = require('../config/db');

async function main() {
  try {
    await connectDatabase();
    const n = await seedStocks();
    console.log(`[REDSTOCKS] Seed complete - ${n} stock records upserted. Inspect them in MongoDB Compass.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[REDSTOCKS] Seed failed:', err.message);
    process.exit(1);
  }
}

main();
