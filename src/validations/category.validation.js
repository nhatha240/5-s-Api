const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    idCategory: Joi.string().custom(objectId),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    idCategory: Joi.string().custom(objectId),
  }),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
