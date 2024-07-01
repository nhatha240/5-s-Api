const mongoose = require('mongoose');

const { Schema } = mongoose;

const paymentSchema = new Schema({
  name: { type: String, required: true },
  type: String,
  allowed: { type: Boolean, default: false },
  cardNumber: Number,
  dateFrom: Date,
  dateTo: Date,
  otherDetail: String,
  idUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
