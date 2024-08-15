const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService, paypalService, commentService } = require('../services');
const pick = require('../utils/pick');
// const Stripe = require('stripe');
// const env = require('../config/config');
// const stripe = Stripe(env.stripe_secret_key);

const addOrder = catchAsync(async (req, res) => {
  const { products } = req.body;
  let { address, phone } = req.body;
  const userId = req.user._id;
  if (!userId || !products || products.length === 0) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid request data' });
  }
  if (!address || !phone) {
    address = req.user.address;
    phone = req.user.phone;
  }
  const order = await orderService.createOrder(userId, products, address, phone);
  const { jsonResponse, httpStatusCode } = await paypalService.createOrder(order);
  const payment = await paypalService.createPayment(jsonResponse.id, jsonResponse.status, order.totalAmount, order.id);
  order.idPayment = payment.id;
  await order.save();
  res.status(httpStatusCode).json(jsonResponse);
});

const orderCapture = catchAsync(async (req, res) => {
  const { orderID } = req.params;
  const { jsonResponse, httpStatusCode } = await paypalService.captureOrder(orderID);
  const { orderId } = await paypalService.updatePayment(orderID, jsonResponse.status);
  const order = await orderService.queryOrders(orderId, req.user.id);
  order.status = 'success';
  await order.save();
  req.user.totalOrder += 1;
  req.user.totalMoney += order.totalAmount;
  res.status(httpStatusCode).json(jsonResponse);
});

const cancelOrder = catchAsync(async (req, res) => {
  const result = await orderService.cancelOrder(req.user._id, req.body.paymentId);
  res.send(result);
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'cursor']);

  const result = await orderService.getOrderByUser(req.user.id, filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.params.orderId);
  if (!order) {
    res.status(httpStatus.NOT_FOUND).json({ message: 'Order not found' });
  }
  order.user = req.user;
  order.products = await Promise.all(order.products.map(async (product) => {
    console.log(product.product._id);
    product.product.rating = await commentService.getCommentsByProduct(product.product._id, req.user.id);
    return product;
  }));
  res.send(order);
});


module.exports = {
  addOrder,
  getOrders,
  cancelOrder,
  orderCapture,
  getOrder,
};
