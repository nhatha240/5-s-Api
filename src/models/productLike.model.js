const { Schema, model } = require('mongoose');

const productLikeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  {
    timestamps: true,
  }
);

const ProductLike = model('ProductLike', productLikeSchema);

module.exports = ProductLike;
