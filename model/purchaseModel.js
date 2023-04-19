const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: String },

  orderItems:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
  }],
  totalPrice: {  type: Number, default:0 },

  paymentMethod: { type: String, },

  shippingAddress:{ type: String, },
  
  status:{  type: String, enum:['Pending', 'Processed', 'Shipped', 'Delivered' ] , default: "Pending"}
},
{
  timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
