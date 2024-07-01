const httpStatus = require('http-status');
const Order = require('../models/order.model');
const ApiError = require('../utils/ApiError');
/**
 * Query for orders
 * @param {string} cursor - The cursor value
 * @param {number} pageSize - The page size
 * @param {object} filter - The filter object
 * @param {string} sortBy - The sort order
 * @returns {Promise<{results: Array, nextCursor: string, hasNextPage: boolean}>}
 */

const queryOrders = async (filter = {status: 1}, options = { cursor: null, limit: 10 }) => {
  let newFilter = filter;
  if (options.cursor) {
    newFilter = { ...newFilter, _id: { $gt: options.cursor } };
  }
  const query = Order.find(newFilter);
  query.sort({ _id: options.sortBy === 'desc' ? -1 : 1 });
  query.limit(options.pageSize + 1); // Fetch one extra to check for next page
  const results = await query.exec();
  const prevCursor = options.cursor && results.length > 0 ? results[0]._id : null;
  const nextCursor = results.length > 0 ? results[results.length - 1]._id : null;
  return {
    nextCursor,
    prevCursor,
    totalResults: results.length,
    results,
  };
};

/**
 * Get order by id
 * @param {string} orderId
 * @returns {Promise<Order>}
 */

const getOrderById = async (orderId) => {
  return Order.findOne({ _id: orderId }).populate('products.idProduct').exec();
};

/**
 * Update order by id
 * @param {string} orderId
 * @param {object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrderById = async (orderId, updateBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Object.assign(order, updateBody);
  await order.save();
  return order;
};

/**
 * Delete order by id
 * @param {string} orderId
 * @returns {Promise<Order>}
 */
const deleteOrderById = async (orderId) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  await order.deleteOne();
  return order;
};

module.exports = {
  queryOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};
