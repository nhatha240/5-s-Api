const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema({
  content: { type: String, required: true },
  time: { type: Date, default: Date.now },
  title: String,
  idUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  idProduct: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
