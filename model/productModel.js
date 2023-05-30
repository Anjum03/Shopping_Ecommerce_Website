const mongoose = require("mongoose");
const UserProduct = require("../model/userProductModel")

const productSchema = new mongoose.Schema({
 
  name: { type: String },
  description: { type: String },
  imageUrl: [String],
  fabric: String,
  event: String,
  category: [String],
  tags: [String],
  type: String,
  size: String,
  bodyShape: String,
  color: String,
  clothMeasurement: String,
  returnPolicy: Number,
  stockAvailability: Number,
  age: String,
  discount: { type: String },
  price: { type: Number },
  totalPrice: { type: Number },
  publish: { type: Boolean, },
}


  , { timestamps: true }
);

productSchema.post('save', async function (doc, next) {

  try {
    if (!doc.variations) { // add a check to ensure that doc.variations is defined
      return next();
    }
    
    const userProduct = new UserProduct({
      // productId: doc._id, // set the productId field to the _id of the parent Product document      name: doc.name,
      discount: doc.discount.map(Number),
      // type: [String ], //featured , trending
      type: doc.type, //featured , trending
      categories: doc.category,
      event: doc.event,
      tags: doc.category,
      age: doc.age,
      type: doc.category,
      thumbs: doc.imageUrl.slice(0, 2),
      previewImages: doc.imageUrl,
      excerpt: doc.description,
      bodyShape: doc.bodyShape,
      clothMeasurement: doc.clothMeasurement,
      returnPolicy: doc.returnPolicy,
      publish: doc.publish,
      
      variations: doc.variations.map(variation => {
       
        return {
          // productId: doc._id,
          
          title: variation.title,
          color: {
            name: variation.color.name,
            thumb: variation.color.name
          },
          materials: variation.materials.map(material => {
            return {
              _id: false,
              name: material.name,
              slug: material.name,
              thumb: material.name,
              price: material.totalPrice
            }
          }),
          sizes: variation.sizes.map(size => {
            return {
              _id: false,
              name: size.name,
              stockAvailability: size.stockAvailability
            }
          })
        }
      })
    });
   
    await userProduct.save();
    next();
  } catch (error) {
    next(error);
  }
});




// Post-save hook to add product to user collection
//hook is pre and post pre means i want do somthing then save in db ex: password and confirm password then save in db same as post save in db then do this 



module.exports = mongoose.model("Product", productSchema)