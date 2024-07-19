const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { Schema } = mongoose;

const subCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  idCategory: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
});

subCategorySchema.plugin(toJSON);
subCategorySchema.plugin(paginate);
subCategorySchema.statics.isNameTaken = async function (name, excludeCategoryId) {
  const category = await this.findOne({ name, _id: { $ne: excludeCategoryId } });
  return !!category;
};
subCategorySchema.index({ name: 1 });
const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
