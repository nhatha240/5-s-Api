const httpStatus = require('http-status');
const { Order, Products } = require('../models');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

const createOrder = async (userId, products, address, phone, coupon = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const productPrices = await Promise.all(
      products.map(async (item) => {
        console.log('item:', item);
        const price = await getProductPrice(item.product, item.quantity, session);
        return {
          ...item,
          priceTotal: price * item.quantity,
          price,
        };
      }),
    );
    const totalAmount = productPrices.reduce((sum, item) => sum + item.priceTotal, 0);
    const newOrder = new Order({
      idUser: userId,
      products: productPrices,
      coupon,
      address,
      phone,
      totalAmount,
    });

    await newOrder.save({session});
    console.log('newOrder:', newOrder);
    await session.commitTransaction();
    session.endSession();
    return newOrder;
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(error.statusCode, error.message);
  }
};
const getProductPrice = async (productId, quantity, session) => {
  const product = await Products.findById(productId);
  if (!product) {
    console.log('Product not found', productId);
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.quantity < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product out of stock');
  }

  product.quantity -= quantity;
  await product.save({session});
  console.log('product:', product.quantity);
  return product.price;
};
/**
 * Query for orders
 * @param {string} cursor - The cursor value
 * @param {number} pageSize - The page size
 * @param {object} filter - The filter object
 * @param {string} sortBy - The sort order
 * @returns {Promise<{results: Array, nextCursor: string, hasNextPage: boolean}>}
 */

const queryOrders = async (filter = { status: 1 }, options = { cursor: null, limit: 10 }) => {
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

const thongKeOrder = async (time) => {
  try {
    const today = new Date();
    const result = await Order.aggregate([
      {
        $match: {
          time: { $gte: time, $lt: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$time' },
          },
          totalAmount: { $sum: '$total' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalsByDay = result.reduce((acc, curr) => {
      acc[curr._id] = curr.totalAmount;
      return acc;
    }, {});
    return totalsByDay;
  } catch (err) {
    console.error('Lỗi:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const totalMonth = async (now, startOfCurrentMonth, startOfLastMonth, endOfLastMonth) => {
  try {
    const currentMonthTotal = await Order.aggregate([
      {
        $match: {
          time: { $gte: startOfCurrentMonth, $lt: now },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' },
        },
      },
    ]);

    const lastMonthTotal = await Order.aggregate([
      {
        $match: {
          time: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' },
        },
      },
    ]);

    const currentMonthAmount = currentMonthTotal.length > 0 ? currentMonthTotal[0].totalAmount : 0;
    const lastMonthAmount = lastMonthTotal.length > 0 ? lastMonthTotal[0].totalAmount : 0;

    const percentageChange = lastMonthAmount === 0 ? 100 : ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100;

    console.log('Current month total:', currentMonthAmount);
    console.log('Last month total:', lastMonthAmount);
    console.log('Percentage change:', percentageChange);

    return {
      currentMonthAmount,
      lastMonthAmount,
      percentageChange,
    };
  } catch (err) {
    console.error('Lỗi:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const ordersTotal = async (time) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          time: { $gte: time },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  } catch (err) {
    console.error('Lỗi:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const getMonthlyOrderStatsAndCompare = async (now, startOfCurrentMonth, startOfLastMonth, endOfLastMonth) => {
  try {
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfCurrentMonth, $lt: now },
    });

    // Tổng số đơn hàng trong tháng trước
    const ordersLastMonth = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    const orderPercentageChange =
      ordersLastMonth === 0 ? 100 : ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;
    return {
      ordersThisMonth,
      ordersLastMonth,
      orderPercentageChange,
    };
  } catch (err) {
    console.error('Lỗi:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};
module.exports = {
  queryOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  thongKeOrder,
  totalMonth,
  getMonthlyOrderStatsAndCompare,
  ordersTotal,
  createOrder,
};
