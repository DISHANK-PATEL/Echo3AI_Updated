const mongoose = require('mongoose');

// Podcast schema
const podcastSchema = new mongoose.Schema({
  title: String,
  creator: String,
  guest: String,
  genre: String,
  description: String,
  thumbnail: String,
  ipfsHash: String,
  podcasterWalletAddress: { type: String, required: false }, // Made optional temporarily
  isLive: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  duration: { type: String, default: '00:00' },
  listeners: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  transcript: { type: String, default: '' },
  published: { type: Boolean, default: false }, // New field to control visibility
}, { suppressReservedKeysWarning: true });

const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast; 