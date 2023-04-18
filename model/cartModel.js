
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    orderItems: [{
        item:{
            type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true
        },
        quantity: {type: Number,default: 0}
    }],

    totalPrice: { type: Number, default: 0 },

    user: {
        type: mongoose.Schema.ObjectId, ref: 'User'
    },
},
    { timestamps: true}
)

module.exports = mongoose.model("Cart", cartSchema);