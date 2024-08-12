const { Products, Shop, ProductLike } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 * @returns {Promise<PaginationResult>}
 */
async function queryProducts(filter = {}, options = { cursor: null, limit: 10 }) {
  const newFilter = {};
  Object.entries(filter).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      newFilter[key] = { $in: value };
    } else {
      newFilter[key] = value;
    }
  });

  if (options.cursor) {
    newFilter._id = { $gt: options.cursor };
    const query = Products.find(newFilter);
    const updatedLimit = options.limit ? options.limit + 1 : 10;
    query.limit(updatedLimit + 1);

    try {
      // Execute the query
      const results = await query.exec();

      // Determine the previous and next cursors
      const prevCursor = options.cursor && results.length > 0 ? results[0]._id : null;
      const nextCursor = results.length > updatedLimit ? results[results.length - 1]._id : null;

      // Return the paginated results
      return {
        nextCursor,
        prevCursor,
        totalResults: results.length,
        results: results.slice(0, options.limit), // Exclude the extra item if present
      };
    } catch (error) {
      throw new Error(`Error fetching results: ${error.message}`);
    }
  } else {
    const query = Products.paginate(newFilter, options);
    return query;
  }
}

/**
 * Create a product
 * @param {string} shopID
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */

async function createProduct(productBody) {
  try {
    const product = await Products.create(productBody);
    return product;
  } catch (error) {
    console.log('error create', error);
    throw new Error('Error creating product', error);
  }
}

/**
 * Get product by id
 * @param {string} productId
 * @returns {Promise<Product>}
 */

async function getProductById(productId) {
  const product = await Products.findOne({ _id: productId });
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}
/**
 * Update product by id
 * @param {Object} admin
 * @param {string} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */

async function updateProduct(product, updateBody) {
  Object.assign(product, updateBody);
  await product.save();
  return product;
}

/**
 * Deletes a product by its ID.
 * @param {Object} admin - The admin object.
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<Object>} - The deleted product.
 * @throws {Error} - If the admin is not allowed to delete the product.
 */
async function deleteProductById(product) {
  await product.deleteOne();
}

/**
 * Shop services
 * @param {string} userID
 * @param {string} shopID
 * @param {Object} productBody
 */
const shopCreateProduct = async (userID, shopID, productBody) => {
  const shop = await Shop.findOne({ _id: shopID, idUser: userID });
  if (!shop) {
    throw new Error('Shop not found');
  }
  const updatedProductBody = { ...productBody, idShop: shopID };
  const product = await Products.create(updatedProductBody);
  return product;
};

/**
 * Retrieves products from the shop based on the provided user ID, filter, and options.
 *
 * @param {string} userID - The ID of the user.
 * @param {object} filter - The filter object to apply to the query.
 * @param {object} options - The options object for pagination.
 * @returns {Promise<object>} - A promise that resolves to the paginated products.
 * @throws {Error} - If the shop is not found.
 */
async function shopGetProducts(userID, filter, options) {
  const shop = await Shop.find({ idUser: userID });
  const shopIds = shop.map((s) => s._id);
  const newFilter = { ...filter, idShop: { $in: shopIds } };
  if (!shop) {
    throw new Error('Shop not found');
  }
  return Products.paginate(newFilter, options);
}

/**
 * Updates a product in the shop.
 *
 * @param {string} userID - The ID of the user/shop owner.
 * @param {string} productID - The ID of the product to update.
 * @param {object} updateBody - The updated product data.
 * @returns {Promise<object>} The updated product.
 * @throws {Error} If the shop or product is not found.
 */

const shopUpdateProduct = async (userID, productID, updateBody) => {
  const shop = await Shop.find({ idUser: userID });
  const shopID = shop.map((s) => s._id);
  if (!shop) {
    throw new Error('Shop not found');
  }
  const product = await Products.findOne({ _id: productID, idShop: { $in: shopID } });
  if (!product) {
    throw new Error('Product not found');
  }
  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Retrieves a product by its ID from the shop of a specific user.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} productID - The ID of the product.
 * @returns {Promise<Object>} - A promise that resolves to the product object.
 * @throws {Error} - If the shop or product is not found.
 */
const shopGetProductById = async (userID, productID) => {
  const shop = await Shop.find({ idUser: userID });
  const shopIds = shop.map((s) => s._id);
  const newFilter = { _id: productID, idShop: { $in: shopIds } };
  if (!shop) {
    throw new Error('Shop not found');
  }
  const product = await Products.findOne(newFilter);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

/**
 * Deletes a product from the shop.
 *
 * @param {string} userID - The ID of the user/shop owner.
 * @param {string} productID - The ID of the product to be deleted.
 * @returns {Promise<Object>} - The deleted product.
 * @throws {Error} - If the shop or product is not found.
 */
const shopDeleteProduct = async (userID, productID) => {
  const shop = await Shop.find({ idUser: userID });
  const shopID = shop.map((s) => s._id);
  if (!shop) {
    throw new Error('Shop not found');
  }
  const product = await Products.findOne({ _id: productID, idShop: { $in: shopID } });
  if (!product) {
    throw new Error('Product not found');
  }
  await product.deleteOne();
  return product;
};
const likeProduct = async (userId, productId) => {
  return ProductLike.create({ userId: userId, productId: productId });
};

const unlikeProduct = async (userId, productId) => {
  return ProductLike.deleteOne({ userId: userId, productId: productId });
};

const addComment = async (productId, rating) => {
  const product = await Products.findOne({ _id: productId });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  product.totalRating += rating;
  product.userRating += 1;
  await product.save();
};
const updateComment = async (productId, rating) => {
  const product = await Products.findOne({ _id: productId });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  product.totalRating += rating;
  await product.save();
};

const deleteComment = async (productId, rating) => {
  const product = await Products.findOne({ _id: productId });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  product.totalRating -= rating;
  product.userRating -= 1;
  await product.save();
};

module.exports = {
  queryProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProductById,
  shopCreateProduct,
  shopUpdateProduct,
  shopGetProducts,
  shopGetProductById,
  shopDeleteProduct,
  likeProduct,
  unlikeProduct,
  addComment,
  updateComment,
  deleteComment,
};
