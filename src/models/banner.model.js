const mongoose = require('mongoose');

const { Schema } = mongoose;

const bannerSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: Boolean, required: true },
    type: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
