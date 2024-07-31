const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService, categoryService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const body = pick(req.body, [
    'name',
    'image',
    'description',
    'discountPrice',
    'price',
    'category',
    'status',
    'isSale',
    'isBestSeller',
    'quantity',
    'tags',
  ]);
  body.image = body.image ?? ['public/uploads/products/default.jpg'];
  body.options = pick(req.body, ['size', 'color']);
  body.category = await categoryService.getCategoryByIds(body.category);
  body.category.forEach(async (categoryId) => {
    console.log('categoryId', categoryId);
    await categoryService.updateItemsCount(categoryId, 1);
  });
  const product = await productService.createProduct(body);
  res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'category']);
  const options = pick(req.query, ['sortBy', 'limit', 'cursor']);
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});
/**
 * Get product by id
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const getProductById = catchAsync(async (req, res) => {
  console.log('getProductById', req.params.id);
  const product = await productService.getProductById(req.params.id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

/**
 * Update product
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProduct = catchAsync(async (req, res) => {
  const body = pick(req.body, [
    'name',
    'image',
    'description',
    'discountPrice',
    'price',
    'category',
    'status',
    'isSale',
    'isBestSeller',
    'quantity',
    'tags',
  ]);
  body.image = body.image ?? ['public/uploads/products/default.jpg'];
  body.options = pick(req.body, ['size', 'color']);
  body.category = await categoryService.getCategoryByIds(body.category);
  console.log('body', body.category);
  const product = await productService.getProductById(req.params.id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (req.admin.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to update this products');
  }
  product.category.forEach((category) => {
    console.log('category', body.category);
    if (!body.category.includes(category)) {
      categoryService.updateItemsCount(category._id, -1);
    }
  });
  body.category.forEach((category) => {
    console.log('category', product.category);
    if (!product.category.includes(category)) {
      categoryService.updateItemsCount(category._id, 1);
    }
  });
  const productUpdate = await productService.updateProduct(product, body);
  res.send(productUpdate);
});

/**
 * Delete product
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */

const deleteProduct = catchAsync(async (req, res) => {
  // The productService.deleteProductById function is called with the product ID from the request parameters.
  if(req.admin.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to delete this products');
  }
  const product = await productService.getProductById(req.params.id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  product.category.forEach(async (categoryId) => {
    await categoryService.updateItemsCount(categoryId, -1);
  });
  await productService.deleteProductById(product);

  // If the product is successfully deleted, an HTTP status of 204 (No Content) is sent back to the client.
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = { getProducts, createProduct, getProductById, updateProduct, deleteProduct };
