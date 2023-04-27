
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' ,
  populate: {
    path: 'price'
  }}],
  status: {
    type: String,
    enum: ["publish", "unpublish", ],
    default: "publish",
  },
  
},{timestamps: true});

module.exports = mongoose.model('Category', categorySchema);
