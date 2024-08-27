const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, productService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const likeProduct = catchAsync(async (req, res) => {
  const productId = req.body.productId;
  const product = await productService.getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Add the product to the user's likes if it's not already there
  const like = await productService.likeProduct(req.user.id, productId);
  res.status(httpStatus.NO_CONTENT).send({like: like});
});

const getLikes = catchAsync(async (req, res) => {
  const products = await productService.getLikedProducts(req.user.id);
  res.send(products);
});

const unlikeProduct = catchAsync(async (req, res) => {
  const productId = req.body.productId;
  const product = await productService.getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Remove the product from the user's likes
  await productService.unlikeProduct(req.user.id, productId);
  res.status(httpStatus.NO_CONTENT).send({});
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  likeProduct,
  unlikeProduct,
  getLikes,
};
