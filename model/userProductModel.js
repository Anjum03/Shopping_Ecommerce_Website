
const mongoose = require('mongoose');

const userProductSchema = new mongoose.Schema({
    name:{ type: String},
    discount:{ type: String},
    imageUrl: [ String],
    type:[ String],
    fabric:[ String],
    event:[ String],
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    size:[ String],
    bodyShape:[ String],
      color:[ String],
      clothMeasurement: [ String],
    //   returnPolicy:{ type: String},
    returnPolicy: [Number],
      price:{ type: Number },
    variations:[{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProduct' },
        id: { type: Number },
        title:{ type: String},
        color: {
            name:{ type: String},
            thumb:{ type: String},
            code:{ type: String},
            
        },
        materials:[
            {
                name: { type: String},
                slug: { type: String},
                thumb: { type: String},
                price: { type: Number},
                
            }],
        sizes:[{
            name: {type: String},
            stock: {type: Number , default: 0},
        }],
    }],
    // publish: {
    //   type: Boolean,
    // },
  },{timestamps: true}
  );
  
  module.exports = mongoose.model("UserProduct", userProductSchema);
  