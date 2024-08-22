const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const { order } = require('./order.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};
const like = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const unlike = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const comment = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
    comment: Joi.string(),
    rating: Joi.number().integer().min(1).max(5).required(),
    order: Joi.string().custom(objectId),
  }),
};
const updateComment = {
  body: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
    comment: Joi.string(),
    rating: Joi.number().integer().min(1).max(5),
  }),
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
};

const getRatings = {
  params: Joi.object().keys({
    comment: Joi.string(),
    products: Joi.string(),
    order: Joi.string(),
  }),
};

const getRating = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),

};
const addCart = {
  body: Joi.object().keys({
    productId: Joi.string().required().custom(objectId),
    quantity: Joi.number().required().integer(),
  }),
};

const deleteCart = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};
const updateCartStatus = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required(),
    processDate: Joi.date(),
    shipDate: Joi.date(),
    deliveryDate: Joi.date(),
  }),
};
const adminComment = {
  body: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
    status: Joi.boolean().required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  like,
  unlike,
  comment,
  updateComment,
  addCart,
  deleteCart,
  adminComment,
  updateCartStatus,
  getRatings,
  getRating,
};
