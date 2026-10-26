const mongoose = require('mongoose');

const SYMBOL_RE = /^[A-Z.]{1,10}$/;

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [SYMBOL_RE, 'Symbol must be 1-10 uppercase letters'],
    },
    companyName: { type: String, required: true, trim: true },
    exchange: { type: String, required: true },
    industry: { type: String, default: 'Unclassified' },
    market: { type: String, default: 'US' },
    currency: { type: String, default: 'USD' },
    description: { type: String, default: '' },
    // Marks records that ship with the demo universe.
    isDemoSeed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

stockSchema.index({ companyName: 'text', symbol: 'text' });

module.exports = mongoose.model('Stock', stockSchema);
