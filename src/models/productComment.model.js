const { Schema, model } = require('mongoose');

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

const productComment = model('ProductComment', productCommentSchema);

module.exports = productComment;
