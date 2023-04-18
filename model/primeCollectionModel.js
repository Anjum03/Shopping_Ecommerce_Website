

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
  age:{ type: String, enum: ['15-20', '20-30', '30-40', '40-5', '50-60', '60-70','70-80', '80-90', '90-100'] },
  discount:{ type: Number },
  price:{ type: Number },
  });


module.exports = mongoose.model('PrimeCollection', primeCollectionSchema);

