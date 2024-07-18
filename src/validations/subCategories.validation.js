const Joi = require('joi');
const { objectId } = require('./custom.validation');
/**
 * Validation for createSubCategory
 */
const createSubCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    idCategory: Joi.string().custom(objectId),
  }),
};

/**
 * Validation for getSubCategories
 */
const getSubCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/**
 * Validation for getSubCategory
 */
const getSubCategory = {
  params: Joi.object().keys({
    subCategoryId: Joi.string
      .custom(objectId)
      .required(),
  }),
};

/**
 * Validation for updateSubCategory
 */

const updateSubCategory = {
  params: Joi.object().keys({
    subCategoryId: Joi.string
      .custom(objectId)
      .required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    idCategory: Joi.string().custom(objectId),
  }),
};

/**
 * Validation for deleteSubCategory
 */
const deleteSubCategory = {
  params: Joi.object().keys({
    subCategoryId: Joi.string
      .custom(objectId)
      .required(),
  }),
};

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
