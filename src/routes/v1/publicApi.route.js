const express = require('express');
const { publicApiController } = require('../../controllers');
const router = express.Router();
router.get('/categories', publicApiController.getCategories);
module.exports = router;

