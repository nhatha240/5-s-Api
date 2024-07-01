const mongoose = require('mongoose');

const { Schema } = mongoose;

const skuSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Sku = mongoose.model('Sku', skuSchema);

module.exports = Sku;
