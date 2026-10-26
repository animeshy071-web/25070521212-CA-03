const { mongoose } = require('../config/db');
const ApiError = require('../utils/ApiError');

/** Returns a clean 503 immediately when MongoDB is unreachable. */
function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return next(
      new ApiError(
        503,
        'DATABASE_UNAVAILABLE',
        'The database is not reachable. Start MongoDB (local or Atlas) and restart the API.',
      ),
    );
  }
  next();
}

module.exports = requireDb;
