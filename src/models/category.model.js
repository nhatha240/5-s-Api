const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  idCategory: [{ type: Schema.Types.ObjectId, ref: 'SubCategory', required: true }],
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
