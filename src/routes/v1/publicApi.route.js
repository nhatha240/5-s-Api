const express = require('express');
const { publicApiController } = require('../../controllers');
const router = express.Router();
router.get('/categories', publicApiController.getCategories);
router.get('/comment/:productId', publicApiController.getComments);
router.get('/comments', publicApiController.getTopComments);
module.exports = router;

