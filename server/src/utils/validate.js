const ApiError = require('./ApiError');

/** Throws an ApiError when the condition is falsy. */
function assert(condition, status, code, message) {
  if (!condition) throw new ApiError(status, code, message);
}

/** Strict positive-integer parser for quantities. Returns null when invalid. */
function parsePositiveInt(value, { min = 1, max = 100000 } = {}) {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/** Escapes user input before embedding it in a RegExp. */
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Parses pagination query params with sane bounds. */
function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Rounds monetary values to 2 decimals to avoid float drift. */
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

module.exports = { assert, parsePositiveInt, escapeRegex, parsePagination, round2 };
