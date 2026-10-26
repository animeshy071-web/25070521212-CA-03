const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
    type: { type: String, enum: ['buy', 'sell'], required: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    // Server-calculated values only - never accepted from the client.
    executionPrice: { type: Number, required: true, min: 0.01 },
    transactionValue: { type: Number, required: true, min: 0 },
    fees: { type: Number, default: 0 },
    status: { type: String, enum: ['executed'], default: 'executed' },
    marketDataSource: { type: String, default: 'demo' },
    marketDataTimestamp: { type: Date },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, createdAt: -1 });

transactionSchema.set('toJSON', {
  transform(doc, ret) {
    ret.symbol = doc.stock && doc.stock.symbol ? doc.stock.symbol : ret.symbol;
    return ret;
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
