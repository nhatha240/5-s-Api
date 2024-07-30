const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { ProductComment } =  require('../models');

const getComments = async (filter, option) => {
  const comments = await ProductComment.paginate(filter, option);
  return comments;
};

const addComment = async (bodyCreate ) => {
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

const updateComment = async (commentId, bodyUpdate) => {
  const comment = await ProductComment.findOne({ _id: commentId });
  if (!comment) {
    throw new Error('Comment not found');
  }
  comment.comment = bodyUpdate.comment;
  return comment.save();
};
module.exports = {
  getComments,
  addComment,
  approveComment,
  updateComment,
};
