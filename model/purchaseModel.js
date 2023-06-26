const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
 
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  items: [  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
    quantity: { type: Number,  },
    price: { type: Number,  },
  } ],
  paymentMode: { type: String,  default: "card",},
  status: {
    type: String,
    enum: ["success", "processing","pending", "Cancelled",],
    default: "pending",
  },
   
},
{timestamps: true}
);

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
