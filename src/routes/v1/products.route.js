const express = require('express');
const validate = require('../../middlewares/validate');
const { getProduct } = require('../../validations/product.validation');
const productsController = require('../../controllers/product.controller');

const router = express.Router();

router.route('/').get(productsController.getProducts);

router.route('/:id').get(validate(getProduct), productsController.getProductById);

module.exports = router;
