const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

const addCart = catchAsync(async (req, res) => {
  const cart = await cartService.addCart(req.user._id, req.body.productId, req.body.quantity);
  res.status(httpStatus.OK).send(cart);
});

const getCart = catchAsync(async (req, res) => {
  const result = await cartService.getCart(req.user.id);
  res.send(result);
});

const removeCart = catchAsync(async (req, res) => {
  const result = await cartService.removeCart(req.user.id, req.body.productId);
  res.send(result);
});

module.exports = {
  addCart,
  getCart,
  removeCart,
};
