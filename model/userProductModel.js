
const mongoose = require('mongoose');

const userProductSchema = new mongoose.Schema({

  // productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', },
  name: { type: String ,   },//product name
  event: String, //product event
  discount: Number, //product discount
  type: [String], //trending , featured
  categories: [{ type: String, lowercase: true }],
  tags: [String], // same category title 
  thumbs: [String], //multiple  or 2 images 
  previewImages: [String], //multiple  or 4 images
  excerpt: String, //product description
  bodyShape: String,
  totalPrice : Number,
  age: String,
  clothMeasurement: String,
  returnPolicy: Number,
  publish: { type: Boolean, },
  variations: [ //variation array
    { //color object
      // _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,       //product color 
      color: {
        name: String,    // product color in lowercase
        thumb: String,  //product img
      },
      materials: [{
        _id: false,
        name: String, //fabric name 
        slug: String, //fabric name in lowercase
        thumb: String, //product img
        price: Number, // product price        
      }],
      sizes: [
        {
        _id: false,
        name: String, // product size
        // stockAvailability: Number, //product stockAvaliablity
        stockAvailability: Number, //product stockAvaliablity
      }
    ],
    }
    //next color start as per above structure
  ],
}
  , { timestamps: true }
);

module.exports = mongoose.model("UserProduct", userProductSchema);
