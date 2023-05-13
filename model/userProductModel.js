
const mongoose = require('mongoose');

const userProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',  },
    name: String, //product name
    discount:String, //product discount
    // imageUrl: [ String], //product image
    type:[ String], //trending , featured
    // fabric:[ String],
    // event:[ String],
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [String], // same category title 
    thumbs: [String], //multiple  or 2 images 
    previewImages: [String], //multiple  or 4 images
    excerpt: String, //product description
    // size:[ String],
    bodyShape:[ String],
    //   color:[ String],
      clothMeasurement: [ String],
    //   returnPolicy:{ type: String},
    returnPolicy: [Number],
    //   price:{ type: Number },
    publish: { type: Boolean, },
    variations:[
        {
          // _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title:String, //product color 
        color: {
            name: String, // product color in lowercase
            thumb: String,  //product img
            // code:{ type: String},  //no use
            
        },
        materials:[{
          _id: false,
            name:   String, //fabric name 
            slug:   String, //fabric name in lowercase
            thumb:  String, //product img
            price:  Number, // product price        
        }],
        sizes:[{
          _id: false,
            name:  String, // product size
            stockAvailability: String, //product stockAvaliablity
        }],
    }],
    
    // publish: {
    //   type: Boolean,
    // },
  }
    ,{timestamps: true}
  );
  
  module.exports = mongoose.model("UserProduct", userProductSchema);
  