const Joi = require('joi');
const { objectId } = require('./custom.validation');

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

