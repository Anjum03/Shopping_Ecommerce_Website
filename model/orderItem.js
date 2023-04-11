const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    quantity: {  type: Number, default:0 },

  category: { type: mongoose.Schema.Types.ObjectId,ref: 'Category',required: true },

},
{
  timestamps: true
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
