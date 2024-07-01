const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getProduct = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const createProduct = {
  params: Joi.object().keys({
    shopID: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string(),
    description: Joi.string().required(),
    originalPrice: Joi.number(),
    price: Joi.number().required(),
    priceSalePercent: Joi.number(),
    idCategory: Joi.string().required(),
    size: Joi.array().required(),
    idSubCategory: Joi.array(),
    status: Joi.string().required(),
    isSale: Joi.boolean(),
    isBestSeller: Joi.boolean(),
    quantity: Joi.number().required(),
    sku: Joi.string(),
    brand: Joi.string(),
    material: Joi.array(),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      image: Joi.string(),
      description: Joi.string(),
      originalPrice: Joi.number(),
      price: Joi.number(),
      priceSalePercent: Joi.number(),
      idCategory: Joi.string(),
      idSubCategory: Joi.array(),
      status: Joi.string(),
      isSale: Joi.boolean(),
      isBestSeller: Joi.boolean(),
      quantity: Joi.number(),
      size: Joi.array(),
      sku: Joi.string(),
      brand: Joi.string(),
      material: Joi.array(),
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
