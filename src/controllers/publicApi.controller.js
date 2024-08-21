const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService, commentService } = require('../services');
const pick = require('../utils/pick');

const getCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await categoryService.publicCategory(filter, options);
  res.status(httpStatus.OK).send(result);
});
const getComments = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const status = 'public';
  const filter = { _id: productId, status };
  console.log(filter);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await commentService.getComments(filter, options);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getCategories,
  getComments,
};
