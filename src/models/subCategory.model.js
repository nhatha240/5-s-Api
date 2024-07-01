const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  idCategory: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
});

const SubCategory = mongoose.model('SubCategory', categorySchema);

module.exports = SubCategory;
