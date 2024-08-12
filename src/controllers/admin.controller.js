const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { adminService, userService, orderService, categoryService, commentService } = require('../services');

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

const getUser = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'email', 'type']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUserId = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userID);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await orderService.orderByUser(req.params.userID);
  const comment = await commentService.queryOneLastComment(req.params.userID);
  user.orders = result;
  user.comments = comment;
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserByUserId(req.params.userID, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userID);
  res.status(httpStatus.NO_CONTENT).send();
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'cursor']);
  options.limit = options.limit ? parseInt(options.limit) : 10;
  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const result = await orderService.getOrderByAdminId(req.params.id);
  res.send(result);
});

const updateOrder = catchAsync(async (req, res) => {
  const body = pick(req.body, ['status', 'processDate', 'shipDate', 'deliveryDate']);
  const result = await orderService.updateStatusOrder(req.params.cartId, body);
  res.send(result);
});

const deleteOrder = catchAsync(async (req, res) => {
  await orderService.removeOrder(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});
/**
 * categories controller
 */

/**
 *  create category controller
 */

const createCategory = catchAsync(async (req, res) => {
  req.body.image = req.body.image ?? 'public/uploads/category/default.jpg';
  const result = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(result);
});

/**
 *  get categories controller
 */

const getCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'category']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await categoryService.queryCategories(filter, options);
  res.send(result);
});
/**
 * get category by id controller
 */

const getCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getCategoryById(req.params.id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(result);
});
/**
 * update category by id controller
 */

const updateCategory = catchAsync(async (req, res) => {
  const result = await categoryService.updateCategoryById(req.body);
  res.send(result);
});
/**
 * delete category by id controller
 */

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.removeCategory(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * subcategories controller
 */

/**
 * create subcategory controller
 */

// const createSubCategory = catchAsync(async (req, res) => {
//   const result = await categoryService.createSubCategory(req.body);
//   res.status(httpStatus.CREATED).send(result);
// });

/**
 * get subcategories controller
 */

// const getSubCategories = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['name', 'role', 'email', 'shop']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await categoryService.querySubCategories(filter, options);
//   res.send(result);
// });
/**
 *
 * get subcategory by id controller
 */

// const getSubCategory = catchAsync(async (req, res) => {
//   const result = await categoryService.getSubCategoryById(req.params.id);
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
//   }
//   res.send(result);
// });
// /**
//  * update subcategory by id controller
//  */

// const updateSubCategory = catchAsync(async (req, res) => {
//   const result = await categoryService.updateSubCategoryById(req.params.id, req.body);
//   res.send(result);
// });
/**
 * delete subcategory by id controller
 */

// const deleteSubCategory = catchAsync(async (req, res) => {
//   await categoryService.deleteSubCategoryById(req.params.id);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const getProducts = catchAsync(async (req, res) => {
//   const result = await productService.queryProducts();
//   res.send(result);
// });

// const createProduct = catchAsync(async (req, res) => {
//   const result = await productService.createProduct(req.params.shopID, req.body);
//   res.status(httpStatus.CREATED).send(result);
// });

// const getProduct = catchAsync(async (req, res) => {
//   const result = await productService.getProductById(req.params.id);
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
//   }
//   res.send(result);
// });

// const updateProduct = catchAsync(async (req, res) => {
//   console.log('req.body', req.body);
//   const result = await productService.updateProduct(req.admin, req.params.id, req.body);
//   res.send(result);
// });

// const deleteProduct = catchAsync(async (req, res) => {
//   await productService.deleteProductById(req.admin, req.params.id);
//   res.status(httpStatus.NO_CONTENT).send();
// });

module.exports = {
  getAdmins,
  getAdminId,
  updateAdmin,
  deleteAdmin,
  getUser,
  getUserId,
  updateUser,
  deleteUser,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  // createProduct,
  // getProducts,
  // getProduct,
  // updateProduct,
  // deleteProduct,
  // createSubCategory,
  // getSubCategories,
  // getSubCategory,
  // updateSubCategory,
  // deleteSubCategory,
};
