const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
      // purchaseId: { type: String },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: { type: Number },
      price: { type: Number },
      totalPrice: Number,
    }
  ],
  allProductTotalPrice: { type: Number, default: 0 },
  paymentMode: {
    type: String,
    enum: ["cash on Demand", 'cheque', "card"],
    default: "card",
  },
  status: {
    type: String,
    enum: ["success", "processing", "pending", "Cancelled"],
    default: "pending",
  },
  deliveredAt: {
    type: Date,
  },
});


orderItemSchema.pre('save', function (next) {
  // Calculate the allProductTotalPrice based on the totalPrice of each item

  const totalPriceArray = this.items.map(item => item.totalPrice);
  const allProductTotalPrice = totalPriceArray.reduce((accumulator, currentValue) => accumulator + currentValue,);
  this.allProductTotalPrice = allProductTotalPrice;
  next();
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
