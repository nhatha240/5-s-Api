const express = require('express');
const authRoute = require('./auth.route');
const adminRoute = require('./admin.router');
const shopRoute = require('./shop.router');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const productsRoute = require('./products.route');
const thongKeRoute= require('./thongKe.route');
const publicApiRoute= require('./publicApi.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/shop',
    route: shopRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/products',
    route: productsRoute,
  },
  {
    path: '/',
    route: publicApiRoute,
  },

];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
