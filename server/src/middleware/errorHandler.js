const env = require('../config/env');

function notFound(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} was not found.`,
    },
  });
}

// Centralized error handler - production responses never leak stack traces.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const isInternal = status >= 500;

  if (isInternal) {
    console.error('[REDSTOCKS] Unhandled error:', err.stack || err.message);
  }

  const message = isInternal && env.isProduction
    ? 'Something went wrong. Please try again later.'
    : err.message || 'Unexpected error';

  res.status(status).json({
    error: {
      code: err.code || (isInternal ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message,
    },
  });
}

module.exports = { notFound, errorHandler };
