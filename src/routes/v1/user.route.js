const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const {userValidation, orderValidation} = require('../../validations');
const {userController, commentsController, orderController, cartController} = require('../../controllers');
const uploadImage = require('../../middlewares/upload');

const router = express.Router();

router.post('/like', auth(), validate(userValidation.like), userController.likeProduct);
router.post('/unlike', auth(), validate(userValidation.unlike), userController.unlikeProduct);
router.post('/rating', auth(), validate(userValidation.comment), commentsController.addComment);
router.put('/rating', auth(), validate(userValidation.updateComment), commentsController.updateComment);
router.get('/rating', auth(), validate(userValidation.getRatings), commentsController.getComments);
router.get('/rating/:id', auth(), validate(userValidation.getRating), commentsController.getRating);
router.post('/add-cart', auth(), validate(userValidation.addCart), cartController.addCart);
router.get('/list-cart', auth(), cartController.getCart);
router.post('/remove-cart', auth(), cartController.removeCart);
router.post('/add-order', auth(), validate(orderValidation.addOrder), orderController.addOrder);
router.get('/orders', auth(), orderController.getOrders); // get order by user id
router.post('/order/:orderID/capture', auth(), validate(orderValidation.order), orderController.orderCapture); // get order by id
router.get('/order/:orderId', auth(), validate(orderValidation.orderId), orderController.getOrder); // get order by id
router.post('/cancel-order', auth(), validate(orderValidation.cancelOrder), orderController.cancelOrder);

router
  .route('/')
  .post(auth(), uploadImage('image'), validate(userValidation.createUser), userController.createUser)
  .get(auth(), validate(userValidation.getUsers), userController.getUser)
  .patch(auth(), uploadImage('image'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
