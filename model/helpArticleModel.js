

const mongoose = require('mongoose');

const helpArticlesSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category',  },

  Name: String,
  Email: String,
  whatsapp: Number,
  size: String,
  message: String,
  color: String,
  // newQuery:{type: String},
  stockAvailability: Number,
  status: { type: String, enum: ['Open', 'Answered', 'Closed'], default: 'Open' },

}, {
  timestamps: true
});


module.exports = mongoose.model('HelpArticle', helpArticlesSchema);
