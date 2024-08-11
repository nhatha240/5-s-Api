const mongoose = require('mongoose');

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // e.g., 'Credit Card', 'PayPal', 'Bank Transfer'
    status: { type: String, default: 'pending' }, // e.g., 'pending', 'completed', 'failed', 'canceled', 'refunded'
    transactionId: { type: String },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
