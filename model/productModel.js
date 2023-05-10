

const mongoose = require("mongoose");
const UserProduct = require("../model/userProductModel")

const productSchema = new mongoose.Schema({
  name: { type: String },
   description: { type: String },
  imageUrl: [String],
   fabric: [String], 
   event: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  size: [String],
   bodyShape: [String],
    color: [String],
  clothMeasurement: [String],
   returnPolicy: [Number], 
   stockAvaliability: [Number],
  // age:{ type: String, enum: ['15-20', '20-25', '25-30','30-36', '37-45', ] },
  age: [String], 
  discount: { type: String },
   price: { type: Number },
  totalPrice: { type: Number },
   publish: { type: Boolean, },
  variations: [
    {
      variationId: { type: String }, // new field for product ID
      title: String,
      color: { name: String, thumb: String, code: String },
      materials: [
        { name: String, slug: String, thumb: String, price: Number },
      ],
      sizes: [{ name: String, stock: [Number] }],
    },
  ],
}, { timestamps: true }
);



// Post-save hook to add product to user collection
//hook is pre and post pre means i want do somthing then save in db ex: password and confirm password then save in db same as post save in db then do this 

productSchema.post('save', async function (doc, next) {

  try {
    const userProductVariations = doc.variations.map((variation) => ({
      variationId: doc._id, // assign product ID as variation ID
      title: variation.title,
      color: {
        name: variation.color.name,
        thumb: variation.color.thumb,
        code: variation.color.code,
      },
      materials: variation.materials.map((fabric) => ({
        name: fabric.name,
        slug: fabric.slug,
        thumb: fabric.thumb,
        price: fabric.price,
      })),
      sizes: variation.sizes.map((size) => ({
        name: size.name,
        stock: size.stockAvaliability
      })),
    }));

    const userProduct = new UserProduct({
      name: doc.name,
      description: doc.description,
      fabric: doc.fabric,
      event: doc.event,
      color: doc.color,
      age: doc.age,
      size: doc.size,
      price: doc.price,
      publish: doc.publish,
      imageUrl: doc.imageUrl,
      discount: doc.discount,
      category: doc.category,
      bodyShape: doc.bodyShape,
      totalPrice: doc.totalPrice,
      returnPolicy: doc.returnPolicy,
      clothMeasurement: doc.clothMeasurement,
      stockAvaliability: doc.stockAvaliability,
      variations: userProductVariations,
    })
    await userProduct.save();
    next();

  } catch (err) {
    next(err);
  }

})


module.exports = mongoose.model("Product", productSchema);
