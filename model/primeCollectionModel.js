

const mongoose = require("mongoose");

const primeCollectionSchema = new mongoose.Schema({
  name:{ type: String},
  description:{ type: String},
  imageUrl: [{ type: String}],
  fabric:{ type: String },
  event:{ type: String },
  category:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  size:{ type: String },
  bodyShape:{ type: String },
  color:{ type: String },
  clothMeasurement: {
      value: { type: Number },
      unit: { type: String, enum: ['meters', 'centimeters', 'inches'] }
  },
  returnPolicy:{ type: Number },
  stockAvaliability:{ type: Number },
  age:{ type: String, enum: ['15-20', '20-25', '25-30', '37-45', ] },
  discount:{ type: String },
  price:{ type: Number },
  });


module.exports = mongoose.model('PrimeCollection', primeCollectionSchema);

