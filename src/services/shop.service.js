const { Shop, Admins } = require('../models');
const ApiError = require('../utils/ApiError');
/**
 * Query for shops
 * @param {Admins} admin - The cursor value
\ * @param {object} filter - The filter object
 * @param {object} options - The sort order
 * @returns {Promise<{results: Array, nextCursor: string, hasNextPage: boolean}>}
 */
async function queryShops(admin, filter = {}, options) {
  // Copy the initial filter object
  const newFilter = { ...filter };

  // Add adminID to the filter if the user is not an admin
  if (admin.role !== 'admin') {
    newFilter.adminID = admin._id;
  }

  // Add cursor-based pagination filter
  if (options.cursor) {
    newFilter._id = { $gt: options.cursor };
  }

  // Create the query with the modified filter
  const query = Shop.find(newFilter);

  // Sort the results based on the sortBy option
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
}
/**
 * Create a shop
 * @param {Object} shopBody
 * @returns {Promise<Shop>}
 */
async function createShop(admin, shopBody) {
  const newShopBody = { ...shopBody }; // Create a new object with the properties of shopBody
  if (!('adminID' in newShopBody)) {
    newShopBody.adminID = admin._id;
  }
  if (newShopBody.adminID !== admin._id && admin.role !== 'admin') {
    newShopBody.adminID = admin._id;
    newShopBody.isApproved = false;
  }
  const shop = await Shop.create(newShopBody);
  const adminCreate = await Admins.findOne({ _id: shop.adminID }).exec();
  adminCreate.shops.push(shop._id);
  await adminCreate.save();
  return shop;
}

/**
 * Get shop by id
 * @param {ObjectId} shopId
 * @returns {Promise<Shop>}
 */
async function getShopById(admin, shopId) {
  if (admin.role !== 'admin') {
    return Shop.findOne({ _id: shopId, adminID: admin._id })
      .populate({ path: 'adminID', select: ['name', 'email', 'id'] })
      .exec();
  }
  return Shop.findOne({ _id: shopId })
    .populate({ path: 'adminID', select: ['name', 'email', 'id'] })
    .exec();
}
/**
 * Update shop by id
 * @param {ObjectId} shopId
 * @param {Object} updateBody
 * @returns {Promise<Shop>}
 */
async function updateShop(admin, shopId, updateBody) {
  const shop = await getShopById(admin, shopId);
  if (!shop) {
    throw new ApiError('Shop not found');
  }
  Object.assign(shop, updateBody);
  await shop.save();
  return shop;
}
/**
 * Delete shop by id
 * @param {ObjectId} shopId
 * @returns {Promise<Shop>}
 */
async function deleteShopById(admin, shopId) {
  const shop = await getShopById(shopId);
  if (!shop) {
    throw new ApiError('Shop not found');
  }
  await shop.deleteOne();
  return shop;
}
const getShops = async (adminId, filter, options) => {
  const finalFilter = { ...filter, adminID: adminId };
  const shops = await Shop.paginate(finalFilter, options);
  return shops;
};

module.exports = {
  queryShops,
  createShop,
  getShopById,
  updateShop,
  deleteShopById,
  getShops,
};
