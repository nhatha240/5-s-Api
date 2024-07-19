const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

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
    productId: Joi.string().custom(objectId),
    comment: Joi.string(),
  }),
};
const updateComment = {
  body: Joi.object().keys({
    comment: Joi.string(),
  }),
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
};
const addCart = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId),
    quantity: Joi.number().integer(),
  }),
};

const deleteCart = {
  body: Joi.object().keys({
    productId: Joi.string().custom(objectId),
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
};
