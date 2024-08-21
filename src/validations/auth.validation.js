const Joi = require('joi');
const { password } = require('./custom.validation');

const registerAdmin = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    image: Joi.string(),
    name: Joi.string().required(),
    role: Joi.string().valid('admin'),
    phone: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
  }),
};
const updateAdmin = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().custom(password),
    image: Joi.string(),
    name: Joi.string().required(),
    role: Joi.string().valid('admin'),
    phone: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
  }),
};

const registerDelivery = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().valid('delivery').required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().custom(password),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};
const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
  }),
};
module.exports = {
  registerAdmin,
  registerDelivery,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  register,
  updateAdmin
};
