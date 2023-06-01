
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' ,
  populate: {
    path: 'price'
  }}],
  Userproducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserProduct' ,
  populate: {
    path: 'price'
  }}],
  publish: {
    type: Boolean,
  },
  
},{timestamps: true});

module.exports = mongoose.model('Category', categorySchema);
