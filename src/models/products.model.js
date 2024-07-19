const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const productsSchema = new Schema(
  {
    name: { type: String, required: true },
    image: String,
    description: String,
    originalPrice: { type: Number },
    price: { type: Number, required: true },
    idCategory: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    size: [{ type: String }],
    idSubCategory: [{ type: Schema.Types.ObjectId, ref: 'SubCategory' }],
    status: { type: String, enum: ['active', 'Available', 'inactive'], default: 'active' },
    isSale: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    quantity: { type: Number, default: 0 },
    color: [{ type: String, default: 'red' }],
    material: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

productsSchema.plugin(toJSON);
productsSchema.plugin(paginate);

const Products = mongoose.model('Product', productsSchema);

module.exports = Products;
