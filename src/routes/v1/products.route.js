const express = require('express');
const validate = require('../../middlewares/validate');
const { getProduct } = require('../../validations/product.validation');
const {productController, orderController} = require('../../controllers');

const router = express.Router();

router.route('/:id').get(validate(getProduct), productController.getProductById);
router.route('/').get(productController.getProducts);

router.post('/webhook', orderController.webhookPayment);
module.exports = router;
