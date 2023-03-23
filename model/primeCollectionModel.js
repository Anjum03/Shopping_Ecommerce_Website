

const mongoose = require("mongoose");

const primeCollectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description:{ type:String, },
    imageUrl: { type: String, required: true },
    fabric:{ type: String },
    event:{ type: String },
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    size:{ type: String },
    bodyShape:{ type: String },
    color:{ type: String },
    clothMeasurement:{ type: String },
    returnPolicy:{ type: Number },
    stockAvaliability:{ type: Number },
    age:{ type: Number },
    price:{ type: Number },
  });


module.exports = mongoose.model('PrimeCollection', primeCollectionSchema);

