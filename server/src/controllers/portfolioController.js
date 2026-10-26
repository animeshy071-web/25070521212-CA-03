const asyncHandler = require('../utils/asyncHandler');
const { getPortfolioSnapshot } = require('../services/portfolioService');

/** GET /api/v1/portfolio */
const getPortfolio = asyncHandler(async (req, res) => {
  const snapshot = await getPortfolioSnapshot(req.user._id);
  res.json({ data: snapshot, meta: { source: 'demo', simulated: true } });
});

/** GET /api/v1/portfolio/holdings */
const getHoldings = asyncHandler(async (req, res) => {
  const snapshot = await getPortfolioSnapshot(req.user._id);
  res.json({ data: snapshot.holdings, meta: { source: 'demo', count: snapshot.holdings.length } });
});

/** GET /api/v1/portfolio/performance */
const getPerformance = asyncHandler(async (req, res) => {
  const snapshot = await getPortfolioSnapshot(req.user._id);
  const { holdings, allocation, ...metrics } = snapshot;
  res.json({ data: metrics, meta: { source: 'demo' } });
});

module.exports = { getPortfolio, getHoldings, getPerformance };
