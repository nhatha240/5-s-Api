const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');
const pick = require('../utils/pick');

const addOrder = catchAsync(async (req, res) => {
  const order = await orderService.addOrder(req.user._id, req.body.productId, req.body.quantity);
  res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'cursor']);

  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const paymentOrder = catchAsync(async (req, res) => {
  const result = await orderService.paymentOrder(req.user._id, req.body.orderId);
  res.send(result);
});

module.exports = {
  addOrder,
  getOrders,
  paymentOrder,
};
