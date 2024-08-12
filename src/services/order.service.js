const httpStatus = require('http-status');
const { Order, Products, Payment } = require('../models');
const ApiError = require('../utils/ApiError');

const createOrder = async (userId, products, address, phone, coupon = null) => {
  try {
    const productPrices = await Promise.all(
      products.map(async (item) => {
        const price = await getProductPrice(item.product, item.quantity);
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

    await newOrder.save();
    return newOrder;
  } catch (error) {
    console.error(error);
    throw new ApiError(error.statusCode, error.message);
  }
};

const cancelOrder = async (userId, transactionId) => {
  const { orderId } = await Payment.findOneAndUpdate({ transactionId }, { status: 'canceled' }).exec();
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  if (order.idUser.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to cancel this order');
  }

  if (order.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order cannot be canceled');
  }

  order.status = 'canceled';
  order.products.forEach(async (item) => {
    const product = await Products.findById(item.product);
    product.quantity += item.quantity;
    await product.save();
  });
  await order.save();
};

const getProductPrice = async (productId, quantity) => {
  const product = await Products.findById(productId);
  if (!product) {
    // console.log('Product not found', productId);
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.quantity < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product out of stock');
  }

  product.quantity -= quantity;
  await product.save();
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
  const query = Order.find(newFilter).populate({ path: 'idUser', select: 'name' }).populate({ path: 'idPayment', select: 'status' });
  query.sort({ _id: options.sortBy === 'desc' ? -1 : 1 });
  query.limit(parseInt(options.limit) + 1); // Fetch one extra to check for next page
  const results = await query.exec();

  // Check if the extra document was fetched
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
};
/**
 * Get order by id
 * @param {string} orderId
 * @returns {Promise<Order>}
 */

const getOrderById = async (idUser, orderId) => {
  return Order.findOne({ _id: orderId, idUser: idUser })
    .select('-idPayment -idUser')
    // .populate({ path: 'products.product', select: '-status -isBestSeller -quantity -description -discountPrice' })
    .exec();
};
const getOrderByAdminId = async (orderId) => {
  return Order.findOne({ _id: orderId })
    .select('-__v')
    .populate({ path: 'products.product', select: '-status -isBestSeller -quantity -description -discountPrice -__v' })
    .populate({ path: 'idUser', select: '-password -__v -isDeleted -isBlocked -lastLogin' })
    .populate({ path: 'idPayment', select: '-__v -orderId -createdAt -updatedAt' })
    .exec();
};

const updateStatusOrder = async (orderId, body) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  if (order.status === 'canceled') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order has been canceled');
  }
  if (body.status === 'process') {
    body.processDate = body.processDate ?? new Date();
  }
  if (body.status === 'shipping') {
    body.shipDate = body.shipDate ?? new Date();
    const shipping = Str_Random(10);
    Payment.findOneAndUpdate({ orderId }, { shippingCode: shipping }).exec();
  }
  if (body.status === 'delivery') {
    body.deliveryDate = body.deliveryDate ?? new Date();
  }
  Object.assign(order, body);
  await order.save();
  return order;
};
function Str_Random(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  // Loop to generate characters for the specified length
  for (let i = 0; i < length; i++) {
    const randomInd = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomInd);
  }
  return result;
}
const getOrderByUser = async (userId) => {
  return Order.find({ idUser: userId })
    .select('-idPayment -idUser')
    .populate({ path: 'products.product', select: '-status -isBestSeller -quantity -description -discountPrice' })
    .exec();
};

const orderByUser = async (userId) => {
  return Order.find({ idUser: userId }, '-products -__v')
    .select('-idPayment -idUser')
    .exec();
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
  cancelOrder,
  getOrderByUser,
  getOrderByAdminId,
  updateStatusOrder,
  orderByUser,
};
