const express = require('express');
const validate = require('../../middlewares/validate');
const { authValidation, shopValidation, productValidation } = require('../../validations');
const { authAdminController, adminController, shopController } = require('../../controllers');
const admin = require('../../middlewares/admin');
const uploadImage = require('../../middlewares/upload');

const router = express.Router();

router.post('/login', validate(authValidation.login), authAdminController.login);
router.post('/register', uploadImage('image'), validate(authValidation.registerAdmin), admin('SuperAdmin'), authAdminController.register);
router.post('/logout', validate(authValidation.logout), authAdminController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authAdminController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authAdminController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authAdminController.resetPassword);
router.post('/send-verification-email', admin(), authAdminController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authAdminController.verifyEmail);
router.post('/change-password', admin(), validate(authValidation.changePassword), authAdminController.changePassword);
/*
 * Admin routes
 */

router.get('/get-admins', admin('SuperAdmin'), adminController.getAdmins);
router.get('/get-admin/:id', admin('SuperAdmin'), adminController.getAdminId);
router.put('/update-admin/:id', uploadImage('image'), admin('SuperAdmin'), adminController.updateAdmin);
router.delete('/delete-admin/:id', admin('SuperAdmin'), adminController.deleteAdmin);
/*
 * Shop routes
 */
router.post('/create-shop', uploadImage('image'), validate(shopValidation.createShop), admin('manageShop'), shopController.createShop);
router.get('/get-shops', admin('manageShop'), adminController.getShops);
router.get('/get-shop/:shopId', validate(shopValidation.getShop), admin('manageShop'), adminController.getShopId);
router.put('/update-shop/:id', uploadImage('image'), admin('manageShop'), validate(shopValidation.updateShop), adminController.updateShop);
router.delete('/delete-shop/:id', admin('manageShop'), adminController.deleteShop);
/*
 * Product routes
 */

router.post(
  '/create-product/:shopID',
  uploadImage('image'),
  validate(productValidation.createProduct),
  admin('manageShop'),
  adminController.createProduct
);
router.get('/get-products', admin('manageShop'), adminController.getProducts);
router.get('/get-product/:id', validate(productValidation.getProduct), admin('manageShop'), adminController.getProduct);
router.put(
  '/update-product/:id',
  uploadImage('image'),
  validate(productValidation.updateProduct),
  admin('manageShop'),
  adminController.updateProduct
);
router.delete(
  '/delete-product/:id',
  validate(productValidation.deleteProduct),
  admin('manageShop'),
  adminController.deleteProduct
);
/*
 * user routes
 */
router.get('/get-user', admin('SuperAdmin'), adminController.getUser);
router.get('/get-user/:userID', admin('SuperAdmin'), adminController.getUserId);
router.put('/update-user/:userID', uploadImage('image'), admin('SuperAdmin'), adminController.updateUser);
router.delete('/delete-user/:userID', admin('SuperAdmin'), adminController.deleteUser);
/*
 * Order routes
 */
router.get('/get-orders', admin('manageShop'), adminController.getOrders);
router.get('/get-order/:id', admin('manageShop'), adminController.getOrder);
router.put('/update-order/:id', admin('manageShop'), adminController.updateOrder);
router.delete('/delete-order/:id', admin('manageShop'), adminController.deleteOrder);

module.exports = router;
