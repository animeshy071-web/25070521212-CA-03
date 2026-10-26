const Stock = require('../models/Stock');
const Watchlist = require('../models/Watchlist');
const marketData = require('../services/providers');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { assert } = require('../utils/validate');

/** GET /api/v1/watchlist */
const getWatchlist = asyncHandler(async (req, res) => {
  const entries = await Watchlist.find({ user: req.user._id })
    .populate('stock')
    .sort({ createdAt: -1 });

  const items = entries
    .filter((e) => e.stock)
    .map((e) => ({
      id: e._id,
      addedAt: e.createdAt,
      stock: e.stock.toJSON(),
      quote: marketData.getQuote(e.stock.symbol),
    }));

  res.json({ data: items, meta: { source: 'demo', count: items.length } });
});

/** POST /api/v1/watchlist  body: { symbol } */
const addToWatchlist = asyncHandler(async (req, res) => {
  const symbol = String(req.body.symbol || '').trim().toUpperCase();
  assert(symbol, 400, 'MISSING_SYMBOL', 'Provide a stock symbol to watch.');

  const stock = await Stock.findOne({ symbol });
  assert(stock, 404, 'STOCK_NOT_FOUND', `No stock record found for "${symbol}".`);

  const duplicate = await Watchlist.findOne({ user: req.user._id, stock: stock._id });
  assert(!duplicate, 409, 'ALREADY_WATCHING', `${symbol} is already in your watchlist.`);

  const entry = await Watchlist.create({ user: req.user._id, stock: stock._id });
  res.status(201).json({
    data: { id: entry._id, addedAt: entry.createdAt, stock: stock.toJSON(), quote: marketData.getQuote(symbol) },
  });
});

/** DELETE /api/v1/watchlist/:stockId */
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const entry = await Watchlist.findOneAndDelete({ user: req.user._id, stock: req.params.stockId });
  assert(entry, 404, 'NOT_IN_WATCHLIST', 'That stock is not in your watchlist.');
  res.json({ data: { message: 'Removed from watchlist.' } });
});

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
