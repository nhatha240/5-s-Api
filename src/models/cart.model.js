const mongoose = require('mongoose');

const { Schema } = mongoose;

const cartSchema = new Schema({
  listProduct: new mongoose.Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  }),
  idUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },

});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
