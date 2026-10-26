const Stock = require('../models/Stock');
const marketData = require('../services/providers');
const asyncHandler = require('../utils/asyncHandler');

async function universeSymbols() {
  const stocks = await Stock.find({}, { symbol: 1, _id: 0 }).sort({ symbol: 1 });
  return stocks.map((s) => s.symbol);
}

/** Adds stored company metadata to provider quote rows. */
async function enrichQuotes(quotes) {
  const stocks = await Stock.find({}, { symbol: 1, companyName: 1, industry: 1 });
  const meta = new Map(stocks.map((s) => [s.symbol, { companyName: s.companyName, industry: s.industry }]));
  return quotes.map((q) => ({ ...q, ...(meta.get(q.symbol) || {}) }));
}

/** GET /api/v1/market/overview - composite, breadth, movers (demo data) */
const getOverview = asyncHandler(async (req, res) => {
  const symbols = await universeSymbols();
  const overview = marketData.getOverview(symbols);
  overview.gainers = await enrichQuotes(overview.gainers);
  overview.losers = await enrichQuotes(overview.losers);
  overview.mostActive = await enrichQuotes(overview.mostActive);
  res.json({ data: overview });
});

/** GET /api/v1/market/movers */
const getMovers = asyncHandler(async (req, res) => {
  const symbols = await universeSymbols();
  const { gainers, losers, mostActive, source, generatedAt, disclaimer } = marketData.getOverview(symbols);
  res.json({
    data: {
      gainers: await enrichQuotes(gainers),
      losers: await enrichQuotes(losers),
      mostActive: await enrichQuotes(mostActive),
      source,
      generatedAt,
      disclaimer,
    },
  });
});

/**
 * GET /api/v1/news - honest response while no news provider is configured.
 * Never fabricate headlines (README Phase 11 acceptance criteria).
 */
const getNews = asyncHandler(async (req, res) => {
  res.json({
    data: [],
    meta: {
      configured: false,
      message: 'No news provider is configured. Headlines will appear here once a licensed provider is added; none are shown so that nothing is fabricated.',
    },
  });
});

module.exports = { getOverview, getMovers, getNews };
