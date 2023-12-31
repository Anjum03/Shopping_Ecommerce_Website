const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: { type: Number },
      price: { type: Number },usdPrice : Number , poundPrice : Number ,
      totalPrice: Number,
      usdTotalPrice: Number,
      poundTotalPrice: Number,
      currency: String
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
    type: String,
  },
});

orderItemSchema.pre('save', function (next) {
  // Calculate the allProductTotalPrice based on the totalPrice of each item
  const totalPriceArray = this.items.map(item => {
    const price = item.currency === 'cad' ? item.cadTotalPrice : item.cadTotalPrice * item.quantity;
    return price;
  });
  const allProductTotalPrice = totalPriceArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  this.allProductTotalPrice = allProductTotalPrice;
  next();
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
