const { Products, Shop, ProductLike, Category } = require('../models');
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

  // Transform filter to support $in operator for arrays
  if (filter.filter) {
    const categories = await Category.find({ name: { $in: filter.name } });
    filter.category = { $in: categories.map((c) => c._id) };
    filter.name = { $regex: filter.name, $options: 'i' };
  }
  if (filter.bestSeller) {
    newFilter.isBestSeller = filter.bestSeller;
  }
  if (filter.fastSale) {
    newFilter.isFastSale = filter.fastSale;
    newFilter.fastSaleStartDate = { $lte: new Date() };
    newFilter.fastSaleEndDate = { $gte: new Date() };
  }
  if (filter.trending) {
    newFilter.trending = filter.trending;
  }

  let query;

  if (options.cursor) {
    query = Products.find({ ...newFilter, _id: { $gt: options.cursor } });
  }
  query = Products.find(newFilter);

  const results = await query
    .limit(parseInt(options.limit) + 1)
    .sort({ _id: 1 })
    .lean();

  const hasNextPage = results.length > options.limit;
  if (hasNextPage) {
    results.pop(); // Remove the extra document
  }
  const prevCursor = options.cursor && results.length > 0 ? results[0]._id : null;
  const nextCursor = hasNextPage ? results[results.length - 1]._id : null;
  return {
    limit: options.limit,
    nextCursor,
    prevCursor,
    totalResults: results.length,
    results,
  };
}

/**
 * Create a product
 * @param {string} shopID
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */

async function createProduct(productBody) {
  try {
    await Products.find({ name: productBody.name })
      .then((product) => {
        if (product.length > 0) {
          throw new Error('Product already exists');
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
    console.log('productBody', productBody);
    const product = await Products.create(productBody);
    return product;
  } catch (error) {
    console.log('error create', error);
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
}

/**
 * Get product by id
 * @param {string} productId
 * @returns {Promise<product>}
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
 * @returns {Promise<product>}
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
const exportProducts = async (filter) => {
  if (!filter) {
    return Products.find({}, '-__v -updatedAt').lean();
  }
  if (filter.name) {
    filter.name = { $regex: filter.name, $options: 'i' };
  }
  if (filter.price) {
    filter.price = { $gte: filter.price };
  }
  if (filter.category) {
    const categories = await Category.find({ name: { $in: filter.category } });
    filter.category = { $in: categories.map((c) => c._id) };
  }

  return Products.find(filter, '-__v -updatedAt').lean();
};

const topSell = async () => {
  return Products.find({ isBestSeller: true }, '-__v -updatedAt').lean();
};
const noiBat = async () => {
  return Products.find({}, '-__v -updatedAt -createdAt ').sort({ updatedAt: -1 }).limit(10).lean();
};
const flashSale = async () => {
  return Products.find(
    { isFastSale: true, fastSaleEndDate: { $gte: new Date() }, fastSaleStartDate: { $lte: new Date() }, status: 'public' },
    '-__v -updatedAt -createdAt',
  ).lean();
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
  exportProducts,
  topSell,
  noiBat,
  flashSale,
};
