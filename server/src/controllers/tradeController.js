const Stock = require('../models/Stock');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const marketData = require('../services/providers');
const { ensurePortfolio, getPortfolioSnapshot } = require('../services/portfolioService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { assert, parsePositiveInt, round2 } = require('../utils/validate');

const SYMBOL_RE = /^[A-Z.]{1,10}$/;

/**
 * PAPER TRADING ENGINE
 *
 * Rules (documented in docs/DATABASE.md):
 *  - Whole shares only; quantity must be an integer 1..100000.
 *  - The execution price is ALWAYS the server-side provider snapshot - the
 *    client can never dictate price, value, balance or holdings.
 *  - Updates run sequentially with pre-checks. Standalone MongoDB (no replica
 *    set) does not support multi-document transactions; the documented safe
 *    alternative is: validate -> write holding/cash -> write transaction, with
 *    the portfolio snapshot always recomputed from holdings + transactions.
 */

async function loadStock(symbolRaw) {
  const symbol = String(symbolRaw || '').trim().toUpperCase();
  assert(SYMBOL_RE.test(symbol), 400, 'INVALID_SYMBOL', 'Stock symbol format is invalid.');
  const stock = await Stock.findOne({ symbol });
  assert(stock, 404, 'STOCK_NOT_FOUND', `No stock record found for "${symbol}".`);
  return stock;
}

/** POST /api/v1/trades/buy  body: { symbol, quantity } */
const buy = asyncHandler(async (req, res) => {
  const quantity = parsePositiveInt(req.body.quantity);
  assert(quantity, 400, 'INVALID_QUANTITY', 'Quantity must be a whole number between 1 and 100000.');

  const stock = await loadStock(req.body.symbol);
  const quote = marketData.getQuote(stock.symbol);
  const executionPrice = quote.price;
  const transactionValue = round2(executionPrice * quantity);

  const portfolio = await ensurePortfolio(req.user._id);
  if (portfolio.cashBalance < transactionValue) {
    throw new ApiError(
      422,
      'INSUFFICIENT_CASH',
      `Insufficient virtual cash: this order needs $${transactionValue.toFixed(2)} but you have $${portfolio.cashBalance.toFixed(2)}.`,
    );
  }

  portfolio.cashBalance = round2(portfolio.cashBalance - transactionValue);

  const holding = await Holding.findOne({ user: req.user._id, stock: stock._id });
  if (holding) {
    const newQuantity = holding.quantity + quantity;
    holding.averageCost = round2(
      (holding.averageCost * holding.quantity + transactionValue) / newQuantity,
    );
    holding.quantity = newQuantity;
    await holding.save();
  } else {
    await Holding.create({
      user: req.user._id,
      stock: stock._id,
      quantity,
      averageCost: executionPrice,
    });
  }
  await portfolio.save();

  const transaction = await Transaction.create({
    user: req.user._id,
    stock: stock._id,
    type: 'buy',
    quantity,
    executionPrice,
    transactionValue,
    status: 'executed',
    marketDataSource: quote.source,
    marketDataTimestamp: new Date(quote.asOf),
  });

  const snapshot = await getPortfolioSnapshot(req.user._id);
  res.status(201).json({
    data: { transaction: await transaction.populate('stock'), portfolio: snapshot },
    meta: { simulated: true, source: quote.source, disclaimer: 'Simulated paper trade using demonstration data. No real order was placed.' },
  });
});

/** POST /api/v1/trades/sell  body: { symbol, quantity } */
const sell = asyncHandler(async (req, res) => {
  const quantity = parsePositiveInt(req.body.quantity);
  assert(quantity, 400, 'INVALID_QUANTITY', 'Quantity must be a whole number between 1 and 100000.');

  const stock = await loadStock(req.body.symbol);
  const holding = await Holding.findOne({ user: req.user._id, stock: stock._id });
  if (!holding || holding.quantity < quantity) {
    const owned = holding ? holding.quantity : 0;
    throw new ApiError(
      422,
      'INSUFFICIENT_HOLDINGS',
      `You only own ${owned} share(s) of ${stock.symbol}; cannot sell ${quantity}.`,
    );
  }

  const quote = marketData.getQuote(stock.symbol);
  const executionPrice = quote.price;
  const transactionValue = round2(executionPrice * quantity);
  const realizedPL = round2((executionPrice - holding.averageCost) * quantity);

  const portfolio = await ensurePortfolio(req.user._id);
  portfolio.cashBalance = round2(portfolio.cashBalance + transactionValue);
  portfolio.realizedPL = round2((portfolio.realizedPL || 0) + realizedPL);

  holding.quantity -= quantity;
  if (holding.quantity === 0) {
    await holding.deleteOne();
  } else {
    await holding.save(); // average cost unchanged on partial sells
  }
  await portfolio.save();

  const transaction = await Transaction.create({
    user: req.user._id,
    stock: stock._id,
    type: 'sell',
    quantity,
    executionPrice,
    transactionValue,
    status: 'executed',
    marketDataSource: quote.source,
    marketDataTimestamp: new Date(quote.asOf),
  });

  const snapshot = await getPortfolioSnapshot(req.user._id);
  res.status(201).json({
    data: { transaction: await transaction.populate('stock'), portfolio: snapshot, realizedPL },
    meta: { simulated: true, source: quote.source, disclaimer: 'Simulated paper trade using demonstration data. No real order was placed.' },
  });
});

/** GET /api/v1/trades?type=buy|sell&page=&limit= */
const listTrades = asyncHandler(async (req, res) => {
  const { parsePagination } = require('../utils/validate');
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { user: req.user._id };
  if (['buy', 'sell'].includes(req.query.type)) filter.type = req.query.type;

  const [total, transactions] = await Promise.all([
    Transaction.countDocuments(filter),
    Transaction.find(filter).populate('stock').sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  res.json({
    data: transactions,
    meta: {
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      simulated: true,
    },
  });
});

/** GET /api/v1/trades/:tradeId */
const getTrade = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.tradeId, user: req.user._id }).populate('stock');
  assert(transaction, 404, 'TRADE_NOT_FOUND', 'Transaction not found.');
  res.json({ data: transaction, meta: { simulated: true } });
});

module.exports = { buy, sell, listTrades, getTrade };
