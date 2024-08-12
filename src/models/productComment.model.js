const { Schema, model } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productCommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    status: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

productCommentSchema.plugin(toJSON);
productCommentSchema.plugin(paginate);
productCommentSchema.index({ userId: 1 });
productCommentSchema.index({ productId: 1, status: 1 });
productCommentSchema.index({ productId: 1, userId: 1 });
const productComment = model('ProductComment', productCommentSchema);

module.exports = productComment;
