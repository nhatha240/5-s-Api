const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { adminService, shopService, productService, userService, orderService } = require('../services');

const getAdmins = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'email', 'shop']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await adminService.getAdmins(filter, options);
  res.send(result);
});

const getAdminId = catchAsync(async (req, res) => {
  const result = await adminService.queryAdminId(req.params.id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  res.send(result);
});

const updateAdmin = catchAsync(async (req, res) => {
  const result = await adminService.updateAdminById(req.params.id, req.body);
  res.send(result);
});

const deleteAdmin = catchAsync(async (req, res) => {
  await adminService.removeAdmin(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const getShops = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'adminID']);
  const options = pick(req.query, ['sortBy', 'limit', 'cursor']);
  const result = await shopService.queryShops(req.admin, filter, options);
  res.send(result);
});

const getShopId = catchAsync(async (req, res) => {
  const result = await shopService.getShopById(req.admin, req.params.shopId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found', 'id not found');
  }
  res.status(httpStatus.OK).send(result);
});

const updateShop = catchAsync(async (req, res) => {
  const result = await shopService.updateShop(req.params.id, req.body);
  res.send(result);
});

const deleteShop = catchAsync(async (req, res) => {
  await shopService.deleteShopById(req.admin, req.params.shopID);
  res.status(httpStatus.NO_CONTENT).send();
});

const getProducts = catchAsync(async (req, res) => {
  const result = await productService.queryProducts();
  res.send(result);
});

const createProduct = catchAsync(async (req, res) => {
  const result = await productService.createProduct(req.params.shopID, req.body);
  res.status(httpStatus.CREATED).send(result);
});

const getProduct = catchAsync(async (req, res) => {
  const result = await productService.getProductById(req.params.id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(result);
});

const updateProduct = catchAsync(async (req, res) => {
  const result = await productService.updateProduct(req.admin, req.params.id, req.body);
  res.send(result);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.admin, req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUser = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUserId = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userID);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userID, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userID);
  res.status(httpStatus.NO_CONTENT).send();
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'course']);
  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const result = await orderService.getOrderById(req.params.id);
  res.send(result);
});

const updateOrder = catchAsync(async (req, res) => {
  const result = await orderService.updateOrder(req.params.id, req.body);
  res.send(result);
});

const deleteOrder = catchAsync(async (req, res) => {
  await orderService.removeOrder(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getAdmins,
  getAdminId,
  updateAdmin,
  deleteAdmin,
  getShops,
  getShopId,
  updateShop,
  deleteShop,
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getUser,
  getUserId,
  updateUser,
  deleteUser,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
};
