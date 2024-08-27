const passport = require('passport');

const checkAuth = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    resolve();
  }
  req.user = user;
  resolve();
};

const isAuth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, checkAuth(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};
module.exports = isAuth;
