const httpStatus = require('http-status');
const { Category, SubCategory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a category
 * @since 1.0.0
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
  if (await Category.isNameTaken(categoryBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category already taken');
  }
  return Category.create(categoryBody);
};

/**
 * Query for categories
 * @since 1.0.0
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */

const queryCategories = async (filter, options) => {
  const categories = await Category.paginate(filter, options);
  return categories;
};

/**
 * Get category by id
 * @since 1.0.0
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */

const getCategoryById = async (id) => {
  return Category.findById(id).populate('idCategory');
};

/**
 * Update category by id
 * @since 1.0.0
 * @param {ObjectId} categoryId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */

const updateCategoryById = async (categoryId, updateBody) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  if (updateBody.name && (await Category.isNameTaken(updateBody.name, categoryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category already taken');
  }
  Object.assign(category, updateBody);
  await category.save();
  return category;
};

/**
 * Delete category by id
 * @since 1.0.0
 * @param {ObjectId} categoryId
 * @returns {Promise<Category>}
 */

const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  await category.remove();
  return category;
};

/**
 * create subcategory
 * @since 1.0.0
 */

const createSubCategory = async (subCategoryBody) => {
  if (await SubCategory.isNameTaken(subCategoryBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'SubCategory already taken');
  }
  return SubCategory.create(subCategoryBody);
};

/**
 * query subcategories
 * @since 1.0.0
 */

const querySubCategories = async (filter, options) => {
  const subCategories = await SubCategory.paginate(filter, options);
  return subCategories;
};

/**
 * get subcategory by id
 * @since 1.0.0
 */

const getSubCategoryById = async (id) => {
  return SubCategory.findById(id);
};

/**
 * update subcategory by id
 * @since 1.0.0
 */

const updateSubCategoryById = async (subCategoryId, updateBody) => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }
  if (updateBody.name && (await SubCategory.isNameTaken(updateBody.name, subCategoryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'SubCategory already taken');
  }
  Object.assign(subCategory, updateBody);
  await subCategory.save();
  return subCategory;
}

/**
 * delete subcategory by id
 * @since 1.0.0
 */

const deleteSubCategoryById = async (subCategoryId) => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }
  await subCategory.remove();
  return subCategory;
}

module.exports = {
  createCategory,
  queryCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  createSubCategory,
  querySubCategories,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById,
};
