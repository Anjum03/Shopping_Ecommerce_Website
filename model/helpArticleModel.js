

const mongoose = require('mongoose');

const helpArticlesSchema = new mongoose.Schema({
  // user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  // product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
  // category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category',  },
  productName: String,
  Name: String, //userName 
  Email: String, //
  whatsapp: Number,
  size:[ String],
  message: String,
  color: [String],
  quantity : { type: Number, default: 0 },
  status: { type: String, enum: ['Open',  'Closed'], default: 'Open' },
  adminEmail: String,
  adminReply:String,

}, {
  timestamps: true
});


module.exports = mongoose.model('HelpArticle', helpArticlesSchema);
