const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { commentService } = require('../services');
const logger = require('../config/logger');

const getComments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'productId']);
  filter.status = true;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await commentService.getComments(filter, options);
  res.send(result);
});

const addComment = catchAsync(async (req, res) => {
  req.body.status = false;
  try {
    commentService.addComment(req.body);
    res.status(httpStatus.CREATED).send('Comment added successfully waiting for approval');
  }catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding comment')
  }
});

const approveComment = catchAsync(async (req, res) => {
  try {
    commentService.approveComment(req.params.commentId);
    res.status(httpStatus.ACCEPTED).send('Comment approved successfully');
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error approving comment');
  }
});
const updateComment = catchAsync(async (req, res) => {
  try {
    commentService.updateComment(req.params.commentId, req.body);
    res.status(httpStatus.ACCEPTED).send('Comment updated successfully');
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating comment');
  }
});
module.exports = {
  getComments,
  addComment,
  approveComment,
  updateComment,
};
