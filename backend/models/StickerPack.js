const mongoose = require('mongoose');

const StickerPackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  numStickers: {
    type: Number,
    required: true,
  },
  isSpecialOffer: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StickerPack', StickerPackSchema);