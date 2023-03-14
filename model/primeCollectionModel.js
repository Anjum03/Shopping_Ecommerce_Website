

const mongoose = require("mongoose");

const primeCollectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    fabric:{ type: String },
    event:{ type: String },
    categories:{ type: Array },
    size:{ type: String },
    bodyShape:{ type: String },
    color:{ type: String },
    clothMeasurement:{ type: String },
    rating:{ type: Number },
    stockAvaliability:{ type: Number },
    age:{ type: Number },
    price:{ type: Number },
  });


module.exports = mongoose.model('PrimeCollection', primeCollectionSchema);

