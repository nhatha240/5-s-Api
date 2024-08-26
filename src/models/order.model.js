const mongoose = require('mongoose');
const { Schema } = mongoose;
const orderDetailSchema = Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  priceTotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    status: { type: String, default: 'pending' }, // pending, success, canceled, process, shipping, delivery
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [orderDetailSchema],
    processDate: { type: Date, default: null },
    shipDate: { type: Date, default: null },
    deliveryDate: { type: Date, default: null },
    coupon: { type: String, default: null },
    address: String,
    phone: String,
    totalAmount: Number,
    rating: { type: Number, default: null },
    idPayment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ idUser: 1 });
orderSchema.index({ status: 1 });
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
