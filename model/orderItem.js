const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category',  },

  name: { type: String, },
  description: { type: String },

  price: { type: Number,},

  quantity: { type: Number }

},
{
  timestamps: true
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
