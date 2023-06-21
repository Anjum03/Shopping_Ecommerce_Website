
const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
    
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProduct',  },
        quantity: { type: Number,  default : 0 },
        price: { type: Number, default : 0   },
        img : [String],
        productName : String
        
},
    { timestamps: true}
)

module.exports = mongoose.model("WishList", wishListSchema);