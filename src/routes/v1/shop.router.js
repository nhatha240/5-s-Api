const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const admin = require('../../middlewares/admin');
const { authAdminController, shopController } = require('../../controllers');

const router = express.Router();

// router.post(
//   '/register/delivery',
//   validate(authValidation.registerDelivery),
//   admin('createDelivery'),
//   authAdminController.register
// );
// router.get('/get-shop', admin('manageShop'), shopController.queryShops);
// // router.get('/:shopId', admin('manageShop'), shopController.getShopId);
// router.post('/create-product/', admin('manageShop'), shopController.createProduct);
// router.get('/get-products', admin('manageShop'), shopController.getShopProducts);
// router.get('/get-product/:productId', admin('manageShop'), shopController.getShopProductById);
// router.put('/update-product/:productId', admin('manageShop'), shopController.updateShopProduct);

module.exports = router;
