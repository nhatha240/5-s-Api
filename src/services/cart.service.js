// const httpStatus = require('http-status');
const { Cart } = require('../models');
// const ApiError = require('../utils/ApiError');

const getCart = async (userId) => {
  const carts = await Cart.findOne({ idUser: userId });
  return carts;
};

const addCart = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ idUser: userId });
  if (!cart) {
    const newCart = new Cart({ idUser: userId });
    newCart.listProduct.push({ product: productId, quantity: quantity });
    newCart.save();
    return newCart;
  } else {
    const product = cart.listProduct.find((product) => product.product === productId);
    if (!product) {
      cart.listProduct.push({ product: productId, quantity: quantity });
      cart.save();
      return cart;
    }
    product.quantity = quantity;
    cart.save();
    return cart;
  }
};

const updateCart = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ idUser: userId });
  const product = cart.listProduct.find((product) => product.product === productId);
  if (!product) {
    cart.listProduct.push({ product: productId, quantity: quantity });
    cart.save();
    return cart;
  }
  product.quantity = quantity;
  cart.save();
  return cart;
};

const deleteCart = async (userId, productId) => {
  const cart = await Cart.findOne({ idUser: userId });
  if (cart) {
    cart.listProduct = cart.listProduct.filter((product) => product.product !== productId);
    await cart.save();
  }
};

const thongKeProduct = async (time) => {
  const now = new Date();
  const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate());
  const cartsAddedToday  = await Cart.countDocuments({
    updatedAt: { $gte: startOfDay, $lt: now }
  });
  return cartsAddedToday;
}

module.exports = {
  getCart,
  addCart,
  updateCart,
  deleteCart,
  thongKeProduct,
};
