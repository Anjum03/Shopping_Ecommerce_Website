const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
      quantity: { type: Number,  }
    }
  ],
  totalPrice: { type: Number,  },
  createdAt: { type: Date, default: Date.now }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
