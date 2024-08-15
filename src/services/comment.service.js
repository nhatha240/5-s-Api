const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { ProductComment, User, Products } = require('../models');
const { productService } = require('./index');

const getComments = async (filter, option) => {
  const products = await Products.find(filter).exec();
  if (!products || products.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  const productId = products.map((product) => product._id);
  const comments = await ProductComment.paginate({ productId: { $in: productId } }, option);
  return comments;
};

const queryOneLastComment = async (userId) => {
  return await ProductComment.findOne({ userId }).populate({ path: 'productId', select: 'name image options price' }).exec();
};

const addComment = async (bodyCreate) => {
  try {
    const products = productService.getProductById(bodyCreate.productId);
    if (!products) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
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

const adminGetRatings = async (filter, options = { cursor: null, limit: 10 }) => {
  let newFilter = filter;
  if (options.cursor) {
    newFilter = { ...newFilter, _id: { $gt: options.cursor } };
  }
  const query = ProductComment.find(newFilter, '-__v -updatedAt').populate({
    path: 'userId',
    select: 'name',
  });
  query.sort({ _id: options.sortBy === 'createdAt' ? -1 : 1 });
  query.limit(parseInt(options.limit) + 1); // Fetch one extra to check for next page
  const results = await query.lean();

  // Check if the extra document was fetched
  const hasNextPage = results.length > options.limit;
  if (hasNextPage) {
    results.pop(); // Remove the extra document
  }
  const prevCursor = options.cursor && results.length > 0 ? results[0]._id : null;
  const nextCursor = hasNextPage ? results[results.length - 1]._id : null;
  return {
    limit: options.limit,
    nextCursor,
    prevCursor,
    totalResults: results.length,
    results,
  };
};
const getRating = async (id) => {
  return await ProductComment.findOne({ _id: id })
    .populate({
      path: 'productId',
      select: 'name image price options discountPrice isSale isBestSeller quantity totalRating userRating',
    })
    .exec();
};
const deleteComment = async (commentId) => {
  const comment = await ProductComment.findOne({ _id: commentId });
  if (!comment) {
    throw new Error('Comment not found');
  }
  const rating = comment.rating;
  await productService.deleteComment(comment.productId, rating);
  return comment.remove();
};

const exportRating = async (filter) => {
  const users = await User.find(filter).exec(); // Step 1: Find all users based on the filter
  const userIds = users.map((user) => user._id); // Step 2: Extract the IDs of these users
  return await ProductComment.find({ userId: { $in: userIds } }, '-__v -updatedAt -')
    .populate({
      path: 'productId',
      select: 'name image price options discountPrice isSale isBestSeller quantity totalRating userRating',
    })
    .name();
};

const getCommentsByProduct = async (productId, userId) => {
  const comment =  await ProductComment.find({ productId, userId }).exec();
  const commentId = comment.map((comment) => comment._id);
  return commentId;
};
module.exports = {
  getComments,
  addComment,
  approveComment,
  updateComment,
  adminGetRatings,
  deleteComment,
  queryOneLastComment,
  exportRating,
  getRating,
  getCommentsByProduct,
};
