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
  const query = Order.find(newFilter)
    .populate({ path: 'idUser', select: 'name' })
    .populate({ path: 'idPayment', select: 'status' });
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
    .populate({ path: 'products.product', select: '-status -isBestSeller -quantity -description -discountPrice' })
    .lean();
};
const getOrderId = async (idUser, orderId) => {
  return Order.findOne({ _id: orderId, idUser: idUser }).exec();
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
  return Order.find({ idUser: userId }, '-products -__v').select('-idPayment -idUser').exec();
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

const totalMonth = async (now, startOfCurrentMonth, startOfLastMonth) => {
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
const exportOrder = async (filter) => {
  try {
    return await Order.find(filter, '-__v -updatedAt ')
      .populate({ path: 'idUser', select: 'name' })
      .populate({ path: 'idPayment', select: 'status' })
      .lean();
  } catch (err) {
    console.error('Lỗi:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};
const getMonthlyOrderStatsAndCompare = async (now, startOfCurrentMonth, startOfLastMonth) => {
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

const topProduct = async (time) => {
  const topProduct = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: time },
      },
    },
    {
      $unwind: '$products',
    },
    {
      $group: {
        _id: '$products.product',
        total: { $sum: '$products.quantity' },
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $limit: 5,
    },
  ]);
  const topProductIds = topProduct.map((item) => item._id);
  const products = await Products.find({ _id: { $in: topProductIds } })
    .select('-status -isBestSeller -quantity -description -discountPrice')
    .lean();
  const productsMap = products.reduce((acc, curr) => {
    acc[curr._id] = curr;
    return acc;
  }, {});
  const result = topProduct.map((item) => {
    return {
      ...item,
      product: productsMap[item._id],
    };
  });
  return result;
};

const itemSold = async () => {
  const time = new Date();
  time.setDate(time.getDate() - 7);
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }, // Match orders created in the last 7 days
        },
      },
      {
        $unwind: '$products', // Deconstruct the products array
      },
      {
        $group: {
          _id: null,
          totalProductsSold: { $sum: '$products.quantity' }, // Sum the quantities of all products
        },
      },
    ]);

    return result.length > 0 ? result[0].totalProductsSold : 0; // Return the total or 0 if no orders found
  } catch (error) {
    console.error('Error counting products sold:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const revenue = async () => {
  try {
    const Revenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Filter for orders in the last 7 days
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }, // Sum the totalAmount field for matching orders
        },
      },
    ]);

    return Revenue.length > 0 ? Revenue[0].total : 0; // Return 0 if no orders found
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

const createdLastTimeCount = async () => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }, // Filter orders created in the last 7 days
        },
      },
      {
        $unwind: '$products', // Unwind the products array
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, // Group by day
          totalRevenue: { $sum: '$products.priceTotal' }, // Sum the priceTotal for each day
        },
      },
      {
        $sort: { _id: 1 }, // Sort by day in ascending order
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              k: '$_id',
              v: '$totalRevenue',
            },
          },
        },
      },
      {
        $project: {
          data: {
            $arrayToObject: '$data',
          },
          _id: 0,
        },
      },
    ];

    const results = await Order.aggregate(pipeline);

    const revenuesByDay = results[0] ? results[0].data : {};

    // Fill in missing days with 0 revenue
    const last7DaysRevenue = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateString = date.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD format
      last7DaysRevenue.push({
        date: dateString,
        revenue: revenuesByDay[dateString] || 0, // Use revenue for the day or 0 if not present
      });
    }

    return last7DaysRevenue.reverse(); // Return in ascending order of days
  } catch (error) {
    console.error('Error counting revenue:', error);
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
  exportOrder,
  topProduct,
  getOrderId,
  itemSold,
  revenue,
  createdLastTimeCount,
};
