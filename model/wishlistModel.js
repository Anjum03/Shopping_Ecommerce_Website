const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
  userEmail: { type: String,},
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProduct' },
      quantity: { type: Number, default: 1 },
      price: { type: Number },
      img: [String],
      productName: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("WishList", wishListSchema);
