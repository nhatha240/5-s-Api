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
  if (filter.name) {
    // Filter by category name first
    const categories = await Category.find({ name: { $regex: filter.name, $options: 'i' } });
    // if (categories.length > 0) {
    //   // If categories are found, filter by their IDs
    //   newFilter.category = { $in: categories.map((c) => c._id) };
    // }
    // // Also filter by product name using regex
    // newFilter.name = { $regex: filter.name, $options: 'i' };
    newFilter.$or = [{ name: { $regex: filter.name, $options: 'i' } }, { category: { $in: categories.map((c) => c._id) } }];
  }
  if (filter.bestSeller) {
    newFilter.isBestSeller = filter.bestSeller;
  }
  if (filter.status) {
    newFilter.status = filter.status;
  }
  if (filter.fastSale) {
    newFilter.isFastSale = filter.fastSale;
    newFilter.fastSaleStartDate = { $lte: new Date() };
    newFilter.fastSaleEndDate = { $gte: new Date() };
  }
  if (filter.trending) {
    newFilter.trending = filter.trending;
  }
  if (filter.color) {
    newFilter.options = {
      $elemMatch: {
        color: { $regex: new RegExp(filter.color, 'i') },
      },
    };
  }
  if (filter.priceRage && filter.priceRage.length === 2 && parseInt(filter.priceRage[0]) <= parseInt(filter.priceRage[1])) {
    newFilter.price = { $gte: parseInt(filter.priceRage[0]), $lte: parseInt(filter.priceRage[1]) };
  }
  if(filter.category){
    newFilter.category = { $in: filter.category };
  }

  let query;
  // options.sortBy = options.sortBy || 'createdAt:desc';
  if (options.cursor) {
    query = Products.paginate(newFilter, options);
  }

  query = Products.paginate(newFilter, options);

  // const results = await query;

  return query;
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
  const product = await Products.findOne({ _id: productId }).populate('category').lean();
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
  const productData = await Products.findOne({ _id: product._id });
  Object.assign(productData, updateBody);
  await productData.save();
  return productData;
}

/**
 * Deletes a product by its ID.
 * @param {Object} admin - The admin object.
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<Object>} - The deleted product.
 * @throws {Error} - If the admin is not allowed to delete the product.
 */
async function deleteProductById(product) {
  await Products.deleteOne({ _id: product._id });
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
  const productLike = await ProductLike.findOne({ productId: productId, userId: userId });
  if (productLike) {
    await ProductLike.deleteOne({ userId: userId, productId: productId });
    return false;
  }
  await ProductLike.create({ userId: userId, productId: productId });
  return true;
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

const getLikedProducts = async (userId) => {
  const likedProducts = await ProductLike.find({ userId: userId }).populate('productId').lean();
  return likedProducts.map((like) => like.productId);
};

const getProductsForUser = async (userId, filter = {}, options = {}) => {
  const newFilter = {};

  // Transform filter to support $in operator for arrays
  if (filter.name) {
    // Filter by category name first
    const categories = await Category.find({ name: { $regex: filter.name, $options: 'i' } });
    // if (categories.length > 0) {
    //   // If categories are found, filter by their IDs
    //   newFilter.category = { $in: categories.map((c) => c._id) };
    // }
    // // Also filter by product name using regex
    // newFilter.name = { $regex: filter.name, $options: 'i' };
    newFilter.$or = [{ name: { $regex: filter.name, $options: 'i' } }, { category: { $in: categories.map((c) => c._id) } }];
  }
  if (filter.bestSeller) {
    newFilter.isBestSeller = filter.bestSeller;
  }
  if (filter.status) {
    newFilter.status = filter.status;
  }
  if (filter.fastSale) {
    newFilter.isFastSale = filter.fastSale;
    newFilter.fastSaleStartDate = { $lte: new Date() };
    newFilter.fastSaleEndDate = { $gte: new Date() };
  }
  if (filter.trending) {
    newFilter.trending = filter.trending;
  }
  if (filter.color) {
    newFilter.options = {
      $elemMatch: {
        color: { $regex: new RegExp(filter.color, 'i') },
      },
    };
  }
  if (filter.priceRage && filter.priceRage.length === 2 && parseInt(filter.priceRage[0]) <= parseInt(filter.priceRage[1])) {
    newFilter.price = { $gte: parseInt(filter.priceRage[0]), $lte: parseInt(filter.priceRage[1]) };
  }
  const limit = parseInt(options.limit) || 10;
  const page = parseInt(options.page) || 1;
  const skip = (page - 1) * limit;
  const totalResults = await Products.countDocuments(newFilter);
  const totalPages = Math.ceil(totalResults / limit);
  const products = await Products.aggregate([
    // Match the products based on any filter criteria
    { $match: newFilter },

    // Perform the lookup to find out if the product is liked by the user
    {
      $lookup: {
        from: 'productlikes', // The collection name (use lowercase and plural if using default naming)
        let: { productId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$productId', '$$productId'] }, { $eq: ['$userId', userId] }] } } },
          { $limit: 1 }, // Limit to one document for efficiency
        ],
        as: 'likedByUser',
      },
    },

    // Add a 'liked' field to each product
    {
      $addFields: {
        liked: { $cond: { if: { $gt: [{ $size: '$likedByUser' }, 0] }, then: true, else: false } },
      },
    },

    // Remove the 'likedByUser' array since it's no longer needed
    { $project: { likedByUser: 0 } },

    // Optionally sort or paginate
    { $sort: { createdAt: -1 } }, // Example: sorting by creation date
    { $skip: skip }, // For pagination
    { $limit: limit }, // For pagination
  ]).exec();

  return { results: products, page: page, limit: limit, totalPages, totalResults };
};

const getProductByIdAndUser = async (productId, userId) => {
  const product = await ProductLike.findOne({ productId: productId, userId: userId });
  if (product) {
    return true;
  }
  return false;
}
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
  getLikedProducts,
  getProductsForUser,
  getProductByIdAndUser,
};
