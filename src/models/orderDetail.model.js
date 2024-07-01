const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderDetailSchema = new Schema({
  idOrder: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  idProduct: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  priceCoupon: Number,
  priceShip: Number,
  priceTotal: { type: Number, required: true },
});

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);

module.exports = OrderDetail;
