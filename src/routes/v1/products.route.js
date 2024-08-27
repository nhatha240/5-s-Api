const express = require('express');
const validate = require('../../middlewares/validate');
const { getProduct } = require('../../validations/product.validation');
const { productController } = require('../../controllers');
const isAuth = require('../../middlewares/isAuth');
const router = express.Router();

router.route('/').get(isAuth(), productController.getProducts);
router.route('/top-sell').get(productController.topSell);
router.route('/noi-bat').get(productController.noiBat);
router.route('/flash-sale').get(productController.flashSale);
router.route('/:id').get(validate(getProduct), isAuth(), productController.getProductById);

// router.post('/webhook', orderController.webhookPayment);
module.exports = router;
