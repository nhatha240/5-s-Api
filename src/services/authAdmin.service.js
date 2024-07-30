const httpStatus = require('http-status');
const tokenService = require('./token.service');
const adminService = require('./admin.service');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Logger } = require('winston');
const emailService = require('./email.service');

/**
 * Login with admin email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<admin>}
 */
const loginAdminWithEmailAndPassword = async (email, password) => {
  const admin = await adminService.getAdminByEmail(email);
  if (!admin || !(await admin.checkPassword(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return admin;
};

/**
 * Register admin
 * @param {*} body
 * @returns
 */

/**
 * refresh Auth Token
 * @param {*} refreshToken
 * @returns
 */

const refreshAuthToken = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const admin = await adminService.getUserById(refreshTokenDoc.user);
    if (!admin) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(admin, 'admins');
  } catch (error) {
    Logger.error(error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {*} email
 * @returns
 */

const forgotPassword = async (email) => {
  const admin = await adminService.getAdminByEmail(email);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No admin found with this email');
  }
  const resetPasswordToken = await tokenService.generateResetPasswordToken(admin);
  await emailService.sendResetPasswordEmail(email, resetPasswordToken, 'admins');
  // Send email
  return ;
};

const resetPassword = async (user, password) => {
  await adminService.updateAdminById(user, { password });
};
module.exports = {
  loginAdminWithEmailAndPassword,
  refreshAuthToken,
  forgotPassword,
  resetPassword,
};
