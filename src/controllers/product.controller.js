const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct( req.params.productId, req.body, req.admin._id);
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
  const product = await productService.getProductById(req.params.productId);
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

  const product = await productService.updateProduct( req.params.productId, req.body, req.admin._id);
  res.send(product);
});

/**
 * Delete product
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */

const deleteProducts = catchAsync(async (req, res) => {
  // The productService.deleteProductById function is called with the product ID from the request parameters.
  await productService.deleteProductById(req.params.productId, req.admin);
  // If the product is successfully deleted, an HTTP status of 204 (No Content) is sent back to the client.
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = { getProducts, createProduct, getProductById, updateProduct, deleteProducts };
