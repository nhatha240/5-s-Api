const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ProductComment } =  require('../models');

const getComments = catchAsync(async (filter, option) => {
  const comments = await ProductComment.paginate(filter, option);
  return comments;
});

const addComment = catchAsync(async (bodyCreate) => {
  return ProductComment.create(bodyCreate);
});

const approveComment = catchAsync(async (commentId) => {
  const comment = await ProductComment.findOne({ _id: commentId });
  if (!comment) {
    throw new Error('Comment not found');
  }
  comment.status = true;
  return comment.save();
});

const updateComment = catchAsync(async (commentId, bodyUpdate) => {
  const comment = await ProductComment.findOne({ _id: commentId });
  if (!comment) {
   throw new Error('Comment not found');
  }
  Object.assign(comment, bodyUpdate);

  return comment.save();
});
module.exports = {
  getComments,
  addComment,
  approveComment,
  updateComment,
};
