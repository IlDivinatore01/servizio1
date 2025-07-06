const mongoose = require('mongoose');

const StickerSchema = new mongoose.Schema({
  characterId: { // The unique ID from the PotterDB API
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: { // Synthesized from other fields [cite: 292]
    type: String,
    default: 'No description available.',
  },
  imageUrl: {
    type: String,
    default: 'no-photo.jpg',
  },
  // Adapted fields from PotterDB API [cite: 296]
  house: {
    type: String,
  },
  species: {
    type: String,
  },
  wand: {
    type: String,
  },
  patronus: {
    type: String,
  },
  rarity: {
    type: Number,
    min: 1,
    max: 5,
    default: 1, // Default rarity
  },
});

module.exports = mongoose.model('Sticker', StickerSchema);