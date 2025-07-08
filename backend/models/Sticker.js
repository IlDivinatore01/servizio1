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
  patronus: {
    type: String,
  },
  gender: { type: String },
  ancestry: { type: String },
  actor: { type: String },
  alternate_names: { type: [String], default: [] },
  alive: { type: Boolean },
  eyeColour: { type: String },
  hairColour: { type: String },
  dateOfBirth: { type: String },
  yearOfBirth: { type: Number },
  wand: {
    wood: { type: String },
    core: { type: String },
    length: { type: Number }
  },
  hogwartsStudent: { type: Boolean },
  hogwartsStaff: { type: Boolean },
  wizard: { type: Boolean },
});

module.exports = mongoose.model('Sticker', StickerSchema);