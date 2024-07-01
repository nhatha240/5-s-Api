const mongoose = require('mongoose');

const { Schema } = mongoose;

const couponSchema = new Schema({
  image: String,
  percent: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  time: String,
  title: { type: String, required: true },
  idUser: { type: Schema.Types.ObjectId, ref: 'User' },
  idShop: { type: Schema.Types.ObjectId, ref: 'Store' },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
