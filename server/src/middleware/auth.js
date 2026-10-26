const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Requires a valid Bearer token and attaches the fresh user document.
 * Role/identity are always re-read from the database so revoked or changed
 * users are handled immediately.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'UNAUTHENTICATED', 'Sign in to continue.');

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new ApiError(401, 'TOKEN_INVALID', 'Your session has expired or is invalid. Please sign in again.');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'USER_NOT_FOUND', 'Account no longer exists.');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Restricts a route to specific roles. Attach after requireAuth. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
    }
    next();
  };
}

/**
 * Attaches req.user when a valid token is present, otherwise continues
 * anonymously - for endpoints that behave slightly differently when signed in.
 */
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, env.jwtSecret);
      req.user = await User.findById(payload.sub);
    }
  } catch {
    // Invalid/absent token on a public route is fine - stay anonymous.
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth };
