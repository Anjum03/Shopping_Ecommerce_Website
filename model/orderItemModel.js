const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
      quantity: { type: Number,  },
      price: { type: Number,  },
    }
  ],
  totalPrice: { type: Number, default: 0 },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;