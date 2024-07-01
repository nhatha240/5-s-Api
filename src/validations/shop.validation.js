const Joi = require('joi');
const { objectId } = require('./custom.validation');

/* adminID: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
 *storeName: { type: String, required: true },
 *description: { type: String },
 *logo: { type: String },
 *coverImage: { type: String },
 *address: { type: String, required: true },
 *isApproved: { type: Boolean, default: false },
 */

const createShop = {
  body: Joi.object().keys({
    adminID: Joi.string().custom(objectId),
    storeName: Joi.string().required(),
    description: Joi.string().required(),
    logo: Joi.string(),
    coverImage: Joi.string().required(),
    address: Joi.string().required(),
    isApproved: Joi.boolean().required(),
    phone: Joi.string().required(),
  }),
};
const getShop = {
  params: Joi.object().keys({
    shopId: Joi.string().custom(objectId),
  }),
};
const updateShop = {
  params: Joi.object().keys({
    shopID: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      storeName: Joi.string(),
      description: Joi.string(),
      logo: Joi.string(),
      coverImage: Joi.string(),
      address: Joi.string(),
      isApproved: Joi.boolean(),
      phone: Joi.string(),
    })
    .min(1),
};

module.exports = {
  createShop,
  getShop,
  updateShop,
};
