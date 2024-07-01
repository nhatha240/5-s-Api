const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addOrder = {
  body: Joi.array().items(Joi.object().keys({
    productId: Joi.string().custom(objectId),
    quantity: Joi.number().required(),
  }))
};

const orderPayment = {
  body: Joi.object().keys({
    paymentId: Joi.string().custom(objectId),
  }),
};

const order = {
  body: Joi.object().keys({
    payment: Joi.number().required(),
    total: Joi.number().required(),
  }),
};

module.exports = {
  addOrder,
  orderPayment,
  order,
};

