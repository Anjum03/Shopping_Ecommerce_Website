const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  items: [  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
    quantity: { type: Number,  },
    price: { type: Number,  },
  } ],
  totalPrice: { type: Number,  },
  paymentMode: { type: String,  default: "pending",},
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
   
},
{timestamps: true}
);

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
