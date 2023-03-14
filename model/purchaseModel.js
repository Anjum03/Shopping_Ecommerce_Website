const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: { type: String, required: true },
  quantity: {  type: Number, default:0 },
  total_price: {  type: Number, default:0 },
  status:{  type: String, enum:['Pending', 'Processed', 'Shipped', 'Delivered' ] , default: "Pending"}
},
{
  timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
