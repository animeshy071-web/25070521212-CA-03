const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { assert } = require('../utils/validate');

/** GET /api/v1/users/me */
const getProfile = asyncHandler(async (req, res) => {
  res.json({ data: { user: req.user.toJSON() } });
});

/** PATCH /api/v1/users/me  body: { name } */
const updateProfile = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  assert(name.length >= 2 && name.length <= 80, 400, 'INVALID_NAME', 'Name must be between 2 and 80 characters.');
  req.user.name = name;
  await req.user.save();
  res.json({ data: { user: req.user.toJSON() } });
});

module.exports = { getProfile, updateProfile };
