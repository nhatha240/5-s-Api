const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getProduct = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    images: Joi.array(),
    description: Joi.string().required(),
    discountPrice: Joi.number(),
    price: Joi.number().required(),
    category: Joi.array().required(),
    size: Joi.array().required(),
    color: Joi.array(),
    status: Joi.string().required().valid('public', 'private'),
    isSale: Joi.boolean(),
    isBestSeller: Joi.boolean(),
    quantity: Joi.number().required(),
    tags: Joi.array(),
    isFastSale: Joi.boolean(),
    fastSalePrice: Joi.number(),
    fastSaleStartDate: Joi.date(),
    fastSaleEndDate: Joi.date(),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      images: Joi.array(),
      description: Joi.string(),
      discountPrice: Joi.number(),
      price: Joi.number(),
      category: Joi.array(),
      size: Joi.array(),
      color: Joi.array(),
      status: Joi.string().valid('public', 'private'),
      isSale: Joi.boolean(),
      isBestSeller: Joi.boolean(),
      quantity: Joi.number(),
      tags: Joi.array(),
      isFastSale: Joi.boolean(),
      fastSalePrice: Joi.number(),
      fastSaleStartDate: Joi.date(),
      fastSaleEndDate: Joi.date(),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
