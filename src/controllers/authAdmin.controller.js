const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authAdminService, tokenService, adminService} = require('../services');
// const { adminRoles } = require('../config/adminRoles');
/**
 * login admin
 * @param {Object} req<{email: string , password: string}>
 * @param {Object} res
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const admin = await authAdminService.loginAdminWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(admin, 'admins');
  res.send({ admin, tokens });
});
const register = catchAsync(async (req, res) => {
  const user = await adminService.createAdmin(req.body);
  res.send(user);
});

const logout = catchAsync(async (req, res) => {
  await authAdminService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authAdminService.refreshAuthToken(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authAdminService.forgotPassword(req.body.email);

  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authAdminService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.OK).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  await authAdminService.sendVerificationEmail(req.user);
  res.status(httpStatus.OK).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authAdminService.verifyEmail(req.query.token);
  res.status(httpStatus.OK).send();
});

const changePassword = catchAsync(async (req, res) => {
  await authAdminService.changePassword(req.user, req.body);
  res.status(httpStatus.NO_CONTENT).send();
});
module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
};
