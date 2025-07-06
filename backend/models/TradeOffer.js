const mongoose = require('mongoose');

const TradeItemSchema = new mongoose.Schema({
  sticker: {
    type: mongoose.Schema.ObjectId,
    ref: 'Sticker',
  },
  quantity: {
    type: Number,
  },
  isCredit: {
    type: Boolean,
    default: false,
  },
  amount: { // For credits
    type: Number,
  }
}, { _id: false });

const TradeOfferSchema = new mongoose.Schema({
  proposerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  // Optional: for direct trades. If null, it's an open offer.
  targetId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  proposerItems: [TradeItemSchema],
  requestedItems: [TradeItemSchema],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TradeOffer', TradeOfferSchema);