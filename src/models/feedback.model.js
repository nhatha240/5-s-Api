const mongoose = require('mongoose');

const { Schema } = mongoose;
const replySchema = new Schema({
  content: { type: String, required: true },
  time: { type: Date, default: Date.now },
  idUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});
const feedbackSchema = new Schema({
  avatar: String,
  content: { type: String, required: true },
  time: { type: Date, default: Date.now },
  rating: { type: Number, required: true },
  status: { type: Boolean, default: false },
  rep: [replySchema],
  idUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
