/**
 * Development helper: boots an in-memory MongoDB (no installation needed) and
 * starts the REDSTOCKS API against it. Data lives only for this process.
 * Usage: npm run dev:memory
 */
require('dotenv').config();

async function main() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  console.log('[REDSTOCKS] Starting in-memory MongoDB (development only)...');
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('redstocks');
  console.log(`[REDSTOCKS] In-memory MongoDB ready at ${process.env.MONGODB_URI}`);

  // Reuse the normal server entry point.
  require('../src/server.js');

  const shutdown = async () => {
    console.log('\n[REDSTOCKS] Shutting down in-memory MongoDB...');
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[REDSTOCKS] Failed to start in-memory MongoDB:', err.message);
  console.error('If this is the first run, mongodb-memory-server may need to download a binary - check your network and retry.');
  process.exit(1);
});
