const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const {userValidation, orderValidation} = require('../../validations');
const {userController, commentsController, orderController, cartController} = require('../../controllers');
const uploadImage = require('../../middlewares/upload');

const router = express.Router();

router.post('/like', auth(), validate(userValidation.like), userController.likeProduct);
router.post('/unlike', auth(), validate(userValidation.unlike), userController.unlikeProduct);
router.post('/comment', auth(), validate(userValidation.comment), commentsController.addComment);
router.post('/update-comment', auth(), validate(userValidation.updateComment), commentsController.updateComment);
router.post('/add-cart', auth(), validate(userValidation.addCart), cartController.addCart);
router.post('/get-cart', auth(), cartController.getCart);
router.post('/add-order', auth(), validate(orderValidation.addOrder), orderController.addOrder);
router.post('/orders', auth(), orderController.getOrders); // get order by user id
router.post('/order/:id', auth(), validate(orderValidation.order), orderController.getOrders); // get order by id
router.post('/payment/:id/:status', auth(), validate(orderValidation.orderPayment), orderController.paymentOrder);

router
  .route('/')
  .post(auth(), uploadImage('image'), validate(userValidation.createUser), userController.createUser)
  .get(auth(), validate(userValidation.getUsers), userController.getUser)
  .patch(auth(), uploadImage('image'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
