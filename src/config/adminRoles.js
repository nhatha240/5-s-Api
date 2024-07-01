const allRoles = {
  admin: [
    'viewUsers',
    'manageUsers',
    'manageOrder',
    'manageShop',
    'createShop',
    'manageDelivery',
    'SuperAdmin',
    'createDelivery',
  ],
  shop: ['viewUsers', 'manageOrder', 'manageShop', 'createDelivery'],
  delivery: ['manageOrder'],
};

const adminRoles = Object.keys(allRoles);
const checkRoles = new Map(Object.entries(allRoles));

module.exports = {
  adminRoles,
  checkRoles,
};
