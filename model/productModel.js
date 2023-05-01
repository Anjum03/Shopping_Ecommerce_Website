

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{ type: String},
    description:{ type: String},
    imageUrl: [{ type: String}],
    fabric:{ type: String },
    event:{ type: String },
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    size:{ type: String },
    bodyShape:{ type: String },
    color:{ type: String },
    clothMeasurement: { type: String },
    returnPolicy:{ type: Number },
    stockAvaliability:{ type: Number },
    age:{ type: String, enum: ['15-20', '20-25', '25-30','30-36', '37-45', ] },
    discount:{ type: String },
    price:{ type: Number },
    totalPrice:{ type: Number },
    publish: {
      type: Boolean,
    },
},{timestamps: true}
);

module.exports = mongoose.model("Product", productSchema);
