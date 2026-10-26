const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/redstocks',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  startingCash: parseFloat(process.env.STARTING_CASH) || 100000,
  marketDataProvider: process.env.MARKET_DATA_PROVIDER || 'demo',
};

// In development a temporary secret keeps local runs working; it must never
// reach production, so production startup fails fast without JWT_SECRET.
if (env.isProduction) {
  const missing = [];
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (missing.length) {
    console.error(`[REDSTOCKS] Missing required production environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  env.jwtSecret = process.env.JWT_SECRET;
} else {
  if (!process.env.JWT_SECRET) {
    console.warn('[REDSTOCKS] JWT_SECRET not set - using a development-only secret. Set JWT_SECRET before deploying.');
  }
  env.jwtSecret = process.env.JWT_SECRET || 'redstocks-dev-secret-do-not-use-in-production';
}

module.exports = env;
