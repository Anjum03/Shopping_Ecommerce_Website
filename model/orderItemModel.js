const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', },
  quantity: Number,
  price: Number,
  purchase: { type: mongoose.Schema.Types.ObjectId,ref: 'Purchase', },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;