
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    orderItems: [{
        item:{
            type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem'
        },
    }],

    userId: { type: String },
},
    { timestamps: true}
)

module.exports = mongoose.model("Cart", cartSchema);