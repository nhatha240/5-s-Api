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

const Products = mongoose.model('Product', productsSchema);

module.exports = Products;
