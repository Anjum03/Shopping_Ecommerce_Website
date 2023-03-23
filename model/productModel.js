





const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{ type: String, required: true},
    imageUrl: { type: String, required:true },
    fabric:{ type: String },
    event:{ type: String },
    // categories:{ type: Array },
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    size:{ type: String },
    bodyShape:{ type: String },
    color:{ type: String },
    clothMeasurement:{ type: Number },
    returnPolicy:{ type: Number },
    stockAvaliability:{ type: Number },
    age:{ type: Number },
    price:{ type: Number },
},{timestamps: true}
);



module.exports = mongoose.model("Product", productSchema);





