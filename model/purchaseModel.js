const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  orderItem:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  }],
  Address:{
    type: String,
    required: true
  },
  phone:{
    type:Number,
    required: true
  },
  dateOrder:{
    type: Date,
    default: Date.now,
  },

  totalPrice: {  type: Number, default:0 },

  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  status:{  type: String, enum:['Pending', 'Processed', 'Shipped', 'Delivered' ] , default: "Pending"}
},
{
  timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
