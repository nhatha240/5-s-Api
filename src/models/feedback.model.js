const mongoose = require('mongoose');

const { Schema } = mongoose;

const feedbackSchema = new Schema({
  avatar: String,
  content: { type: String, required: true },
  time: { type: Date, default: Date.now },
  idShop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  idUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
