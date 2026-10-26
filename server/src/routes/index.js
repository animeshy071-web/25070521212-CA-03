const router = require('express').Router();
const { dbState } = require('../config/db');
const env = require('../config/env');
const marketData = require('../services/providers');
const requireDb = require('../middleware/database');

/* GET /api/v1/health - never exposes secrets. */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'REDSTOCKS API',
    environment: env.nodeEnv,
    database: dbState(),
    marketDataProvider: marketData.name,
    uptimeSeconds: Math.round(process.uptime()),
    time: new Date().toISOString(),
  });
});

router.use(requireDb);
router.use('/auth', require('./authRoutes'));
router.use('/stocks', require('./stockRoutes'));
router.use('/watchlist', require('./watchlistRoutes'));
router.use('/portfolio', require('./portfolioRoutes'));
router.use('/trades', require('./tradeRoutes'));
router.use('/market', require('./marketRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;
