const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number,
    required: true
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  coverImage: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['physical', 'digital'],
    default: 'physical'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);