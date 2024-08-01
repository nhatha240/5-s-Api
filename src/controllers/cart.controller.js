const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

const addCart = catchAsync(async (req, res) => {
  const cart = await cartService.addCart(req.user._id, req.body.productId, req.body.quantity);
  res.status(httpStatus.CREATED).send(cart);
});

const getCart = catchAsync(async (req, res) => {
  const result = await cartService.getCart(req.user._id);
  res.send(result);
});


module.exports = {
  addCart,
  getCart,
};
