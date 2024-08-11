const mongoose = require('mongoose');

const { Schema } = mongoose;
const orderDetailSchema = Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  priceTotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  statusOrder: { type: String, default: 'pending' }, // pending, success, cancel, shipping, complete
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [orderDetailSchema],
  coupon: { type: String, default: null },
  address: String,
  phone: String,
  totalAmount: Number,
  rating: { type: Number, default: null },
  idPayment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
