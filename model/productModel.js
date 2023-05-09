

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{ type: String},
    description:{ type: String},
    imageUrl: [ String],
    fabric:[ String],
    event:[ String],
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    size:[ String],
    bodyShape:[ String],
    color:[ String],
    clothMeasurement: [ String],
    returnPolicy:[ Number ],
    stockAvaliability:[Number ],
    age:{ type: String, enum: ['15-20', '20-25', '25-30','30-36', '37-45', ] },
    discount:{ type: String},
    price:{ type: Number },
    totalPrice:{ type: Number },
    publish: {
      type: Boolean,
    },
},{timestamps: true}
);

module.exports = mongoose.model("Product", productSchema);
