// const httpStatus = require('http-status');
const { Cart, Products } = require('../models');
const ApiError = require('../utils/ApiError');
// const ApiError = require('../utils/ApiError');

const getCart = async (userId) => {
  return Cart.findOne({ userId }).select('-userId -createdAt -updatedAt -__v').populate('products.product', '-__v -createdAt -updatedAt -quantity -description -category');
};

const addCart = async (userId, productId, quantity, color, size) => {
  try {
    let cart = await Cart.findOne({ userId: userId });
    const product = await Products.findOne({ _id: productId });
    if (!product) {
      throw new Error('Product not found');
    }
    if (!cart) {
      // If the cart doesn't exist, create a new one
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      if(quantity > product.quantity){
        quantity = product.quantity;
      }
      cart = new Cart({
        userId: userId,
        products: [{ product: productId, quantity: quantity, color: color, size: size }],
      });
    } else {
      // Ensure products is initialized
      if (!cart.products) {
        cart.products = [];
      }

      // Find the product in the cart
      const productIndex = cart.products.findIndex(
        (product) => product.product.toString() === productId.toString()
      );

      if (productIndex === -1) {
        // If the product is not in the cart, add it
        if (quantity <= 0) {
          throw new Error('Quantity must be greater than 0');
        }
        if(quantity > product.quantity){
          quantity = product.quantity;
        }
        cart.products.push({ product: productId, quantity: quantity, color: color, size: size });
      } else {
        // If the product is already in the cart, update the quantity
        cart.products[productIndex].quantity += quantity;
        cart.products[productIndex].color = color;
        cart.products[productIndex].size = size;
        if(cart.products[productIndex].quantity > product.quantity){
          cart.products[productIndex].quantity = product.quantity;
          cart.products[productIndex].color = color;
          cart.products[productIndex].size = size;
        }
        // Remove the product if the quantity is zero or less
        if (cart.products[productIndex].quantity <= 0) {
          cart.products.splice(productIndex, 1);
        }
      }
    }

    // Save the cart
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error);
  }
};


const thongKeProduct = async (time) => {
  const now = new Date();
  const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate());
  const cartsAddedToday = await Cart.countDocuments({
    updatedAt: { $gte: startOfDay, $lt: now },
  });
  return cartsAddedToday;
};

const removeCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId: userId });
  if (!cart) {
    const cart = new Cart({
      userId: userId,
      products: [],
    });
    await cart.save();
    throw new ApiError(400,'Product not found in cart');
  }

  const productIndex = cart.products.findIndex(
    (product) => product.product.toString() === productId.toString()
  );

  if (productIndex === -1) {
    throw new ApiError(400,'Product not found in cart');
  }

  cart.products.splice(productIndex, 1);
  await cart.save();
  return cart;
};

const deleteCart = async (userId) => {
  const cart = await Cart.deleteOne({ userId: userId });
  cart.products = [];
  cart.save();
}
module.exports = {
  getCart,
  addCart,
  thongKeProduct,
  removeCart,
  deleteCart,
};
