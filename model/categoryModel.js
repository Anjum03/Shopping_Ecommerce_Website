
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    userProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'UserProduct', populate: true }
    ],
    publish: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
    strictPopulate: false, // Move this line within the same object
  }
);

module.exports = mongoose.model('Category', categorySchema);
