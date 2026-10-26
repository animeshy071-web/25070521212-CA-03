const env = require('../../config/env');

/**
 * Provider abstraction. The rest of the app depends only on this interface:
 *   getQuote(symbol), getHistory(symbol, range),
 *   getCompanyProfile(symbol), getOverview(symbols)
 *
 * To add a real provider (e.g. a licensed market-data API), implement the same
 * four functions in a new module under providers/ and register it here. The
 * UI keeps working unchanged and all responses carry a `source` label that
 * must be reported accurately (never label demo data as live).
 */
const registry = {
  demo: require('./demoProvider'),
};

const provider = registry[env.marketDataProvider] || registry.demo;

module.exports = {
  name: registry[env.marketDataProvider] ? env.marketDataProvider : 'demo',
  ...provider,
};
