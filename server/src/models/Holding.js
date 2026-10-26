const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
    // Whole shares only (project accounting rule - see docs/DATABASE.md).
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    averageCost: { type: Number, required: true, min: 0.01 },
  },
  { timestamps: true },
);

holdingSchema.index({ user: 1, stock: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
