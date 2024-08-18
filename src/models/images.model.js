const mongoose = require('mongoose');

const { Schema } = mongoose;

const imagesSchema = new Schema({
  path: String,
  time: { type: Date, default: Date.now },
  status: { type: String, default: 'created' },
});

const Images = mongoose.model('Images', imagesSchema);

module.exports = Images;
