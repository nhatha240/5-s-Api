const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  idCategory: [{ type: Schema.Types.ObjectId, ref: 'SubCategory', required: true }],
});
// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);
categorySchema.statics.isNameTaken = async function (name, excludeCategoryId) {
  const category = await this.findOne({ name, _id: { $ne: excludeCategoryId } });
  return !!category;
};
categorySchema.index({ name: 1 });
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
