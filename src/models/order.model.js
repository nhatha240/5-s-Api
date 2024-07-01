const mongoose = require('mongoose');

const { Schema } = mongoose;
const orderDetailSchema = new Schema({
  idProduct: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  priceCoupon:{ type: Number, required: true },
  priceShip: { type: Number, required: true },
  priceTotal: { type: Number, required: true },
});

const orderSchema = new Schema({
  statusOrder: { type: String, default: 'pending' },
  idUser: { type: Schema.Types.ObjectId, ref: 'User' },
  products: [orderDetailSchema],
  address: String,
  phone: String,
  total: Number,
  time: { type: Date, default: Date.now },
  rating: Number,
  idPayment: { type: Schema.Types.ObjectId, ref: 'Payment' },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
