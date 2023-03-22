
// models/category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  primeCollections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PrimeCollection' }],
},{timestamps: true});

module.exports = mongoose.model('Category', categorySchema);
