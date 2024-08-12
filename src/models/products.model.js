const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const productsSchema = new Schema(
  {
    name: { type: String, required: true },
    image: [{ type: String }],
    description: String,
    discountPrice: { type: Number },
    price: { type: Number, required: true },
    category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    size: [{ type: String }],
    status: { type: String, enum: ['public', 'private', 'outStock'], default: 'private' },
    isSale: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    quantity: { type: Number, default: 0 },
    tags: [{ type: String }],
    totalRating: { type: Number, default: 0 },
    userRating: { type: Number, default: 0 },
    options: [
      {
        size: [{ type: String }],
        color: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  },
);

productsSchema.plugin(toJSON);
productsSchema.plugin(paginate);
productsSchema.index({ name: 'text', status: 1 });
productsSchema.index({ category: 1, status: 1 });
productsSchema.index({ isSale: 1 });
productsSchema.index({ isBestSeller: 1 });
productsSchema.index({ tags: 1 });
productsSchema.index({ productsSchema: 1 });
const Products = mongoose.model('Product', productsSchema);

module.exports = Products;
