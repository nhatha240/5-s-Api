const httpStatus = require('http-status');
const { Category, Products } = require('../models');
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

const getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId).lean();
    if (!category) {
      return null;
    }
    const products = await Products.find({ category: categoryId }).limit(10);
    category.products = products;
    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

const getCategoryByIds = async (ids) => {
  return Category.find(
    {
      _id: { $in: ids },
    },
    '_id',
  )
    .then((items) => items.map((item) => item._id))
    .catch((err) => {
      console.error(err); // Handle any errors
    });
};

/**
 * Update category by id
 * @since 1.0.0
 * @param {ObjectId} categoryId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */

const updateCategoryById = async (updateBody) => {
  const category = await Category.findOne({_id: updateBody.categoryId}).exec();
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  if (updateBody.name && (await Category.isNameTaken(updateBody.name, updateBody.categoryId))) {
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
 * Update category items count
 * @param {string} categoryId
 * @param {number} increment
 */
const updateItemsCount = async (categoryId, increment) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    category.itemsCount += increment;
    return await category.save();
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

/**
 * Query for categories
 * @since 1.0.0
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */

const publicCategory = async (filter, options) => {
  options.select = '-itemsCount';
  const categories = await Category.paginate(filter, options);
  return categories;
};

module.exports = {
  createCategory,
  queryCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  updateItemsCount,
  publicCategory,
  getCategoryByIds,
};
