const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const OwnedStickerSchema = new mongoose.Schema({
  sticker: {
    type: mongoose.Schema.ObjectId,
    ref: 'Sticker',
    required: true,
  },
  characterId: { // From PotterDB API
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  favoriteSuperhero: { // Adapted to favorite Harry Potter character [cite: 390]
    type: String,
    required: [true, 'Please add your favorite character'],
  },
  credits: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  ownedStickers: [OwnedStickerSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt [cite: 196]
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);