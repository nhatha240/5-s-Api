const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { ProductComment } = require('../models');
const { productService } = require('./index');

const getComments = async (filter, option) => {
  const comments = await ProductComment.paginate(filter, option);
  return comments;
};

const addComment = async (bodyCreate) => {
  try {
    return ProductComment.create(bodyCreate);
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding comment');
  }
};

const approveComment = async (commentId) => {
  const comment = await ProductComment.findOne({ _id: commentId });
  if (!comment) {
    throw new Error('Comment not found');
  }
  comment.status = true;
  return comment.save();
};

const updateComment = async (userId, commentId, commentValue, rating) => {
  const comment = await ProductComment.findOne({ _id: commentId, userId });
  if (!comment) {
    throw new Error('Comment not found');
  }
  if (rating) {
    const addRating = rating - comment.rating;
    productService.updateComment(comment.productId, addRating);
    comment.rating = rating;
  }
  comment.comment = commentValue;
  return comment.save();
};

const adminGetRatings = async (filter, option) => {
  const comments = await ProductComment.paginate(filter, option);
  return comments;
};

const deleteComment = async (commentId) => {
  const comment = await ProductComment.findOne({ _id: commentId });
  if (!comment) {
    throw new Error('Comment not found');
  }
  const rating = comment.rating;
  await productService.deleteComment(comment.productId, rating);
  return comment.remove();
}
module.exports = {
  getComments,
  addComment,
  approveComment,
  updateComment,
  adminGetRatings,
  deleteComment,
};
