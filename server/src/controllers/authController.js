const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ensurePortfolio } = require('../services/portfolioService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { assert } = require('../utils/validate');
const env = require('../config/env');

const BCRYPT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/** POST /api/v1/auth/register */
const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  assert(name.length >= 2 && name.length <= 80, 400, 'INVALID_NAME', 'Name must be between 2 and 80 characters.');
  assert(EMAIL_RE.test(email), 400, 'INVALID_EMAIL', 'Please provide a valid email address.');
  assert(password.length >= 8, 400, 'WEAK_PASSWORD', 'Password must be at least 8 characters long.');

  const existing = await User.findOne({ email });
  assert(!existing, 409, 'EMAIL_TAKEN', 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash }); // role defaults to 'user'
  await ensurePortfolio(user._id); // provision the virtual trading account

  res.status(201).json({
    data: { token: signToken(user), user: user.toJSON() },
  });
});

/** POST /api/v1/auth/login */
const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  assert(EMAIL_RE.test(email) && password, 400, 'INVALID_INPUT', 'Email and password are required.');

  const user = await User.findOne({ email });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  // Same response either way - do not reveal which accounts exist.
  assert(user && valid, 401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');

  res.json({ data: { token: signToken(user), user: user.toJSON() } });
});

/** POST /api/v1/auth/logout - stateless JWT; the client discards its token. */
const logout = asyncHandler(async (req, res) => {
  res.json({ data: { message: 'Signed out. Discard the token on the client.' } });
});

/** GET /api/v1/auth/me */
const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: req.user.toJSON() } });
});

module.exports = { register, login, logout, me };
