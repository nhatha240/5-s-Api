const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { shopService, productService } = require('../services');

const queryShops = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await shopService.getShops(req.admin._id, filter, options);
  if (result.results.length) {
    res.status(httpStatus.OK).send(result);
  }
  res.status(httpStatus.NO_CONTENT).send(result);
});

const getShopId = catchAsync(async (req, res) => {
  const shop = await shopService.getShopById(req.params.shopId);
  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  res.status(httpStatus.OK).send(shop);
});
const createProduct = catchAsync(async (req, res) => {
  const product = await productService.shopCreateProduct(req.admin._id, req.shopID, req.body);
  res.status(httpStatus.CREATED).send(product);
});

const getShopProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'name',
    'categoryId',
    'idSubCategory',
    'isSale',
    'isBestSeller',
    'status',
    'brand',
    'material',
    'size',
    'price',
    'priceSalePercent',
    'quantity',
    'sku',
    'idShop',
    'idCategory',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.shopGetProducts(req.admin._id, filter, options);
  res.send(result);
});

const getShopProductById = catchAsync(async (req, res) => {
  const product = await productService.shopGetProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.status(httpStatus.OK).send(product);
});
const updateShopProduct = catchAsync(async (req, res) => {
  const product = await productService.shopUpdateProduct(req.admin._id, req.params.productId, req.body);
  res.status(httpStatus.OK).send(product);
});

const deleteShopProduct = catchAsync(async (req, res) => {
  await productService.shopDeleteProduct(req.admin._id, req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

const createShop = catchAsync(async (req, res) => {
  const shop = await shopService.createShop(req.admin, req.body);
  res.status(httpStatus.CREATED).send(shop);
});
module.exports = {
  queryShops,
  getShopId,
  createProduct,
  getShopProducts,
  getShopProductById,
  updateShopProduct,
  deleteShopProduct,
  createShop,
};
