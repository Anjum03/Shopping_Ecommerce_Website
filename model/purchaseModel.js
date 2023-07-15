const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  quantity: { type: Number },
  price: { type: Number },
  paymentMode: {
    type: String,
    enum: ['cash on Demand', 'cheque', 'card'],
    default: 'card',
  },
  status: {
    type: String,
    enum: ['success', 'processing', 'pending', 'Cancelled'],
    default: 'pending',
  },
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
