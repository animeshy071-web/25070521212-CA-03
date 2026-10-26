const Stock = require('../models/Stock');
const Watchlist = require('../models/Watchlist');
const marketData = require('../services/providers');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { assert, escapeRegex, parsePagination } = require('../utils/validate');

const SYMBOL_RE = /^[A-Z.]{1,10}$/;

function withQuote(stock) {
  const plain = stock.toJSON ? stock.toJSON() : stock;
  return { ...plain, quote: marketData.getQuote(plain.symbol) };
}

/** GET /api/v1/stocks?q=&industry=&sort=&page=&limit= */
const listStocks = asyncHandler(async (req, res) => {
  const filter = {};
  const q = String(req.query.q || '').trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ symbol: rx }, { companyName: rx }];
  }
  if (req.query.industry) filter.industry = String(req.query.industry);
  if (req.query.exchange) filter.exchange = String(req.query.exchange);

  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 25 });

  // Sort on 'change' happens in memory after quotes are attached.
  const sortKey = ['symbol', 'name', 'change', 'price'].includes(req.query.sort) ? req.query.sort : 'symbol';
  const dbSort = sortKey === 'name' ? { companyName: 1 } : { symbol: 1 };

  const [total, stocks] = await Promise.all([
    Stock.countDocuments(filter),
    Stock.find(filter).sort(dbSort).skip(skip).limit(limit),
  ]);

  let rows = stocks.map(withQuote);
  if (sortKey === 'change') rows.sort((a, b) => b.quote.changePercent - a.quote.changePercent);
  if (sortKey === 'price') rows.sort((a, b) => b.quote.price - a.quote.price);

  const industries = await Stock.distinct('industry');

  res.json({
    data: rows,
    meta: {
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      industries: industries.sort(),
      source: 'demo',
      disclaimer: 'Demonstration data. Quotes are generated locally and are not live market data.',
    },
  });
});

/** GET /api/v1/stocks/search?q= (top 8 lightweight matches for the search box) */
const searchStocks = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  assert(q.length >= 1, 400, 'MISSING_QUERY', 'Provide a search term.');
  const rx = new RegExp(escapeRegex(q), 'i');
  const stocks = await Stock.find({ $or: [{ symbol: rx }, { companyName: rx }] })
    .sort({ symbol: 1 })
    .limit(8);
  res.json({ data: stocks.map((s) => s.toJSON()) });
});

/** GET /api/v1/stocks/:symbol - metadata + quote (+ watchlist flag when authed) */
const getStock = asyncHandler(async (req, res) => {
  const symbol = String(req.params.symbol || '').toUpperCase();
  assert(SYMBOL_RE.test(symbol), 400, 'INVALID_SYMBOL', 'Stock symbol format is invalid.');
  const stock = await Stock.findOne({ symbol });
  assert(stock, 404, 'STOCK_NOT_FOUND', `No stock record found for "${symbol}".`);

  let inWatchlist = null;
  if (req.user) {
    inWatchlist = Boolean(await Watchlist.exists({ user: req.user._id, stock: stock._id }));
  }

  res.json({
    data: {
      ...withQuote(stock),
      inWatchlist,
    },
    meta: { source: 'demo', disclaimer: 'Demonstration data. Not real or live market data.' },
  });
});

/** GET /api/v1/stocks/:symbol/quote */
const getStockQuote = asyncHandler(async (req, res) => {
  const symbol = String(req.params.symbol || '').toUpperCase();
  assert(SYMBOL_RE.test(symbol), 400, 'INVALID_SYMBOL', 'Stock symbol format is invalid.');
  res.json({ data: marketData.getQuote(symbol) });
});

/** GET /api/v1/stocks/:symbol/history?range=1M|3M|6M|1Y */
const getStockHistory = asyncHandler(async (req, res) => {
  const symbol = String(req.params.symbol || '').toUpperCase();
  assert(SYMBOL_RE.test(symbol), 400, 'INVALID_SYMBOL', 'Stock symbol format is invalid.');
  const stock = await Stock.findOne({ symbol });
  assert(stock, 404, 'STOCK_NOT_FOUND', `No stock record found for "${symbol}".`);
  res.json({ data: marketData.getHistory(symbol, String(req.query.range || '3M')) });
});

module.exports = { listStocks, searchStocks, getStock, getStockQuote, getStockHistory };
