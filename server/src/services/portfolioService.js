const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const env = require('../config/env');
const marketData = require('./providers');
const { round2 } = require('../utils/validate');

/**
 * Returns the user's portfolio, creating one with the configured starting
 * virtual cash on first access (also covers users created before this record).
 */
async function ensurePortfolio(userId) {
  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({
      user: userId,
      cashBalance: env.startingCash,
      startingBalance: env.startingCash,
      currency: 'USD',
    });
  }
  return portfolio;
}

/**
 * Authoritative portfolio snapshot. Every financial value here is computed on
 * the server from stored holdings and the configured price provider.
 */
async function getPortfolioSnapshot(userId) {
  const portfolio = await ensurePortfolio(userId);
  const holdings = await Holding.find({ user: userId }).populate('stock');

  const rows = [];
  for (const holding of holdings) {
    if (!holding.stock) continue; // stock record removed; skip defensively
    const quote = marketData.getQuote(holding.stock.symbol);
    const marketValue = round2(quote.price * holding.quantity);
    const costBasis = round2(holding.averageCost * holding.quantity);
    rows.push({
      stock: {
        symbol: holding.stock.symbol,
        companyName: holding.stock.companyName,
        industry: holding.stock.industry,
      },
      quantity: holding.quantity,
      averageCost: round2(holding.averageCost),
      currentPrice: quote.price,
      marketValue,
      costBasis,
      unrealizedPL: round2(marketValue - costBasis),
      unrealizedPLPercent: round2((marketValue / costBasis - 1) * 100),
    });
  }

  const holdingsValue = round2(rows.reduce((sum, r) => sum + r.marketValue, 0));
  const investedCost = round2(rows.reduce((sum, r) => sum + r.costBasis, 0));
  const totalValue = round2(portfolio.cashBalance + holdingsValue);
  const unrealizedPL = round2(holdingsValue - investedCost);
  const realizedPL = round2(portfolio.realizedPL || 0);

  return {
    currency: portfolio.currency,
    startingBalance: round2(portfolio.startingBalance),
    cashBalance: round2(portfolio.cashBalance),
    holdingsValue,
    investedCost,
    totalValue,
    unrealizedPL,
    realizedPL,
    totalPL: round2(totalValue - portfolio.startingBalance),
    totalReturnPercent: round2((totalValue / portfolio.startingBalance - 1) * 100),
    holdings: rows,
    allocation: rows
      .map((r) => ({
        symbol: r.stock.symbol,
        companyName: r.stock.companyName,
        value: r.marketValue,
        percent: totalValue > 0 ? round2((r.marketValue / totalValue) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { ensurePortfolio, getPortfolioSnapshot };
