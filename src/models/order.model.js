const mongoose = require('mongoose');

const { Schema } = mongoose;
const orderDetailSchema = new mongoose.Schema({
  idProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  priceCoupon: { type: Number, required: true },
  priceShip: { type: Number, required: true },
  priceTotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  statusOrder: { type: String, default: 'pending' },
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [orderDetailSchema],
  address: String,
  phone: String,
  total: Number,
  time: { type: Date, default: Date.now },
  rating: Number,
  idPayment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
