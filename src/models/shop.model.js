const mongoose = require('mongoose');

const { toJSON, paginate } = require('./plugins');

const shopSchema = new mongoose.Schema({
  adminID: { type: mongoose.Schema.Types.ObjectId, ref: 'Admins', required: true },
  storeName: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  coverImage: { type: String },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
shopSchema.plugin(toJSON);
shopSchema.plugin(paginate);

const Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;
