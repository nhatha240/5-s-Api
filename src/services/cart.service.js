// const httpStatus = require('http-status');
const { Cart } = require('../models');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const getCart = catchAsync(async (userId) => {
  const carts = await Cart.findOne({idUser: userId});
  return carts;
});

const addCart = catchAsync(async (userId, productId, quantity) => {
  const cart = await Cart.findOne({idUser: userId});
  if(!cart){
    const newCart = new Cart({idUser: userId});
    newCart.listProduct.push({product: productId, quantity: quantity});
    newCart.save();
    return newCart;
  }
  else{
    const product = cart.listProduct.find(product => product.product === productId);
    if(!product){
      cart.listProduct.push({product: productId, quantity: quantity});
      cart.save();
      return cart;
    }
    product.quantity = quantity;
    cart.save();
    return cart;
  }
});

const updateCart = catchAsync(async (userId, productId, quantity) => {
  const cart = await Cart.findOne({idUser: userId});
  const product = cart.listProduct.find(product => product.product === productId);
  if(!product){
    cart.listProduct.push({product: productId, quantity: quantity});
    cart.save();
    return cart;
  }
  product.quantity = quantity;
  cart.save();
  return cart;
});

const deleteCart = catchAsync(async (userId, productId) => {
  const cart = await Cart.findOne({idUser: userId});
  if (cart) {
    cart.listProduct = cart.listProduct.filter(product => product.product !== productId);
    await cart.save();
  }
});

module.exports = {
  getCart,
  addCart,
  updateCart,
  deleteCart,
};
