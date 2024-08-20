const express = require('express');
const validate = require('../../middlewares/validate');
const { authValidation, productValidation, categoryValidation, userValidation } = require('../../validations');
const { authAdminController, adminController, productController, commentsController } = require('../../controllers');
const admin = require('../../middlewares/admin');
const uploadImage = require('../../middlewares/upload');

const router = express.Router();

router.post('/login', validate(authValidation.login), authAdminController.login);
router.post('/register', uploadImage('image','single'), validate(authValidation.registerAdmin), admin('SuperAdmin'), authAdminController.register);
router.post('/update', uploadImage('image','single'), validate(authValidation.updateAdmin), admin('SuperAdmin'), authAdminController.updateAdmin);
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
 * Product routes
 */

router.post(
  '/create-product/',
  uploadImage('image', 'array'),
  validate(productValidation.createProduct),
  admin(),
  productController.createProduct
);
router.get('/get-products', admin(), productController.getAdminProducts);
router.get('/get-product/:id', validate(productValidation.getProduct), admin(), productController.getProductById);
router.put(
  '/update-product/:id',
  uploadImage('image', 'array'),
  validate(productValidation.updateProduct),
  admin(),
  productController.updateProduct
);
router.delete(
  '/delete-product/:id',
  validate(productValidation.deleteProduct),
  admin(),
  productController.deleteProduct
);
/*
 * user routes
 */
router.get('/customers', admin(), adminController.getUser);
router.get('/customer/:userID', admin(), adminController.getUserId);
router.put('/customer/:userID', uploadImage('image'), admin(), adminController.updateUser);
router.delete('/customer/:userID', admin(), adminController.deleteUser);
/*
 * Order routes
 */
router.get('/list-order', admin(), adminController.getOrders);
router.get('/order/:id', admin(), adminController.getOrder);
router.put('/order/:cartId', admin(), validate(userValidation.updateCartStatus), adminController.updateOrder);
router.delete('/delete-order/:id', admin(), adminController.deleteOrder);

/*
 * categories routes
 */

router.post('/create-category',uploadImage('image'), admin(), validate(categoryValidation.createCategory), adminController.createCategory);
router.get('/get-categories', admin(), validate(categoryValidation.getCategories), adminController.getCategories);
router.get('/get-category/:id', admin(), validate(categoryValidation.getCategory), adminController.getCategory);
router.put('/update-category',uploadImage('image','single' ), admin(), validate(categoryValidation.updateCategory), adminController.updateCategory);
router.delete('/delete-category/:id', admin(), validate(categoryValidation.deleteCategory), adminController.deleteCategory);

// /*
//   * Subcategories routes
//   */
// router.post('/create-subcategory', admin(), validate(subCategoryValidation.createSubCategory), adminController.createSubCategory);
// router.get('/get-subcategories', admin(), adminController.getSubCategories);
// router.get('/get-subcategory/:id', admin(), validate(subCategoryValidation.getSubCategory), adminController.getSubCategory);
// router.put('/update-subcategory/:id', admin(), validate(subCategoryValidation.updateSubCategory), adminController.updateSubCategory);
// router.delete('/delete-subcategory/:id', admin(), validate(subCategoryValidation.deleteSubCategory), adminController.deleteSubCategory);

/**
 * rating routes
 */
router.get('/list-rating', admin(), commentsController.getRatings);
router.put('/rating', admin(), validate(userValidation.adminComment), commentsController.approveComment);
router.delete('/rating/:id', admin(), commentsController.deleteComment);

/**
 * csv routes
 */

// router.post('/upload-csv', uploadImage('csv'), admin(), adminController.uploadCsv);
router.get('/csv/order', admin(), adminController.csvOrder);
router.get('/csv/products', admin(), adminController.csvProducts);
router.get('/csv/customers', admin(), adminController.csvCustomers);
router.get('/csv/rating', admin(), adminController.csvRating);

module.exports = router;
