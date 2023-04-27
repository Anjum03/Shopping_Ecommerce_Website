

const mongoose = require('mongoose');

const helpArticlesSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  Name: String,
  Email: String,
  whatsapp: Number,
  size: String,
  stockAvailability: Number,
  status: { type: String, enum: ['Open', 'Answered', 'Closed'], default: 'Open' },

}, {
  timestamps: true
});


module.exports = mongoose.model('HelpArticle', helpArticlesSchema);
