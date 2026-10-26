const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Virtual money only. The backend is the sole writer of this value.
    cashBalance: { type: Number, required: true, min: 0 },
    startingBalance: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    realizedPL: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
