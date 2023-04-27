const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  items: [  { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem',  } ],
  totalPrice: { type: Number,  },
  createdAt: { type: Date, default: Date.now },
   
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
