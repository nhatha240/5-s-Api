const express = require('express');
const validate = require('../../middlewares/validate');
const { authValidation, productValidation, categoryValidation } = require('../../validations');
const { authAdminController, adminController, productController } = require('../../controllers');
const admin = require('../../middlewares/admin');
const uploadImage = require('../../middlewares/upload');

const router = express.Router();

router.post('/login', validate(authValidation.login), authAdminController.login);
router.post('/register', uploadImage('image','single'), validate(authValidation.registerAdmin), admin('SuperAdmin'), authAdminController.register);
=======
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
 * Product routes
 */

router.post(
  '/create-product/',
  uploadImage('images', 'array'),
  validate(productValidation.createProduct),
  admin(),
  productController.createProduct
);
router.get('/get-products', admin(), productController.getProducts);
router.get('/get-product/:id', validate(productValidation.getProduct), admin(), productController.getProductById);
console.log('productValidation.updateProduct');
router.put(
  '/update-product/:id',
  uploadImage('images', 'array'),
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
router.get('/get-user', admin('SuperAdmin'), adminController.getUser);
router.get('/get-user/:userID', admin('SuperAdmin'), adminController.getUserId);
router.put('/update-user/:userID', uploadImage('image'), admin('SuperAdmin'), adminController.updateUser);
router.delete('/delete-user/:userID', admin('SuperAdmin'), adminController.deleteUser);
/*
 * Order routes
 */
router.get('/get-orders', admin(), adminController.getOrders);
router.get('/get-order/:id', admin(), adminController.getOrder);
router.put('/update-order/:id', admin(), adminController.updateOrder);
router.delete('/delete-order/:id', admin(), adminController.deleteOrder);

/*
 * categories routes
 */

router.post('/create-category',uploadImage('image'), admin(), validate(categoryValidation.createCategory), adminController.createCategory);
router.get('/get-categories', admin(), validate(categoryValidation.getCategories), adminController.getCategories);
router.get('/get-category/:id', admin(), validate(categoryValidation.getCategory), adminController.getCategory);
router.put('/update-category',uploadImage('image'), admin(), validate(categoryValidation.updateCategory), adminController.updateCategory);
router.delete('/delete-category/:id', admin(), validate(categoryValidation.deleteCategory), adminController.deleteCategory);

// /*
//   * Subcategories routes
//   */
// router.post('/create-subcategory', admin(), validate(subCategoryValidation.createSubCategory), adminController.createSubCategory);
// router.get('/get-subcategories', admin(), adminController.getSubCategories);
// router.get('/get-subcategory/:id', admin(), validate(subCategoryValidation.getSubCategory), adminController.getSubCategory);
// router.put('/update-subcategory/:id', admin(), validate(subCategoryValidation.updateSubCategory), adminController.updateSubCategory);
// router.delete('/delete-subcategory/:id', admin(), validate(subCategoryValidation.deleteSubCategory), adminController.deleteSubCategory);


module.exports = router;
