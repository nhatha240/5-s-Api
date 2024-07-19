const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { checkRoles } = require('../config/adminRoles');

const verifyAdmin = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.admin = user;
  console.log(req.body);
  if (requiredRights.length) {
    const userRights = checkRoles.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const admin =
  (...requiredRights) =>
    async (req, res, next) => {
      return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyAdmin(req, resolve, reject, requiredRights))(req, res, next);
      })
        .then(() => next())
        .catch((err) => next(err));
    };

module.exports = admin;
