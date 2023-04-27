const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', },
  quantity:{type: Number},
  price:   {type: Number},
  paymentMode: { type: String },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;