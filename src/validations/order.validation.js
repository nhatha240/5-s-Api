const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { param } = require('../routes/v1/admin.router');

const addOrder = {
  body:Joi.object().keys({
    products: Joi.array().items(Joi.object().keys({
      product: Joi.string().custom(objectId),
      quantity: Joi.number().required(),
    })),
    address: Joi.string(),
    phone: Joi.string(),
  }),
};

const orderPayment = {
  body: Joi.object().keys({
    paymentId: Joi.string(),
    orderId: Joi.string().custom(objectId),
    status: Joi.string(),
  }),
};

const order = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};
const cancelOrder = {
  body: Joi.object().keys({
    paymentId: Joi.string().required(),
  }),
};
module.exports = {
  addOrder,
  orderPayment,
  order,
  cancelOrder,
};

