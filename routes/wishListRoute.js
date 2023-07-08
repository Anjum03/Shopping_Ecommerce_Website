
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Wishlist = require("../model/wishlistModel");
const Product = require("../model/userProductModel");
// const OrderItem = require("../model/orderItemModel");
const { verifyUserToken, } = require('../middleware/token');


//create cart
// router.post('/wishlist', verifyUserToken, async (req, res) => {

//   try {
//     const { productId,userId } = req.body;

//     // Get the product details from the database
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(400).json({ success: false, message: 'Invalid product ID' });
//     }

//     //if user have wishlist
//     const existWishlist = await Wishlist.findOne( {userId})

//     if(existWishlist){
//       // existWishlist.quantity += quantity ,
//       existWishlist.price = product.variations.price

//       await existWishlist.save()

//       res.status(200).json({success : true , message : `Quantity Added` , data : existWishlist})
//     }
//  else{

//    const newWishlist = await Wishlist.create({
//      userId: userId,
//      productId: productId,
//     //  quantity: quantity,
//      price:product.variations.price , // Assuming the price is the first material's price
//      img: product.thumbs,
//      productName: product.name
//    });
//    console.log(price,    'price')

//    res.status(200).json({ success: true, message: 'Existing product added to wishlist', data:newWishlist});
  
//  }

//   }
//   catch (error) {
//     console.log(error)
//     res.status(500).json({ success: false, message: 'Backend Server Error : ', error });
//   }
// });
router.post('/wishlist', async (req, res) => {
  try {
    const { productId, userEmail } = req.body;

    // Get the product details from the database
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Check if user exists
    const existingUser = await Wishlist.findOne({ userEmail });

    if (existingUser) {
      // Check if the product already exists in the user's wishlist
      const existingProduct = existingUser.products.find(
        (product) => product.productId.toString() === productId
      );

      if (existingProduct) {
        return res.status(400).json({ success: false, message: 'Product already exists in wishlist' });
      }
    const variation = product.variations[0];

    if (!variation) {
      return res.status(404).json({ success: false, message: 'Variation not found' });
    }

    const price = variation.materials[0].price;

      // Add the product to the existing user's wishlist
      existingUser.products.push({
        productId: productId,
        price: price,           //actually price in wihlist
        img: product.thumbs,
        productName: product.name
      });

      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: 'Product added to existing user wishlist',
        data: existingUser
      });
    } else {
      // Create a new wishlist entry for the user

    const variation = product.variations[0];

    if (!variation) {
      return res.status(404).json({ success: false, message: 'Variation not found' });
    }

    const price = variation.materials[0].price;


      const newWishlist = await Wishlist.create({
        userEmail: userEmail,
        products: [
          {
            productId: productId,
            price: price,
            img: product.thumbs,
            productName: product.name
          }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Product added to new user wishlist',
        data: newWishlist
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Backend Server Error:', error });
  }
});



//update Cart
// wishlistId
// router.put('/wishlist/:wishlistId', verifyUserToken, async (req, res) => {

//   const wishlistId = req.params.wishlistId
//   const { quantity } = req.body;

//   try {
    
//     //check if the user has access to the cart ==--- current user
//     const cart = await Cart.findOne(userId);

//     if (!cart) {
//       return res.status(404).json({ success: false, message: 'Cart not found' });
//     }

//     // Check if the item exists in the cart
//     const cartItem = cart.items.find(item => item._id.equals(id));

//     if (!cartItem) {
//       return res.status(400).json({ success: false, message: 'Item not found in cart' });
//     }

//     // Update the item quantity and prices
//     const product = await Product.findById(cartItem.productId);
//     if (!product) {
//       return res.status(400).json({ success: false, message: 'Product not found' });
//     }

//     const oldQuantity = cartItem.quantity;
//     const newQuantity = quantity;
//     cartItem.quantity = newQuantity;

//     cart.totalPrice = cart.totalPrice - (product.totalPrice * oldQuantity) + (product.totalPrice * quantity);

//     // Save the changes to the cart
//     const updateCart = await cart.save();
//     res.status(200).json({ success: true, message: 'Cart Updated SuccessFully', data: { updateCart } });

//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server error' });
//   }

// });




//delete Cart
router.delete('/wishlist/:wishlistId/:productId', async (req, res) => {
  const wishlistId = req.params.wishlistId;
  const productId = req.params.productId;
  
  try {
    // Find the wishlist item to be deleted
    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    // Find the index of the product to be deleted in the products array
    const productIndex = wishlist.products.findIndex(product => product.productId.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    // Remove the product from the products array
    wishlist.products.splice(productIndex, 1);

    // Save the updated wishlist
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Product removed from wishlist and remaining Details', data: wishlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});




//get Cart 
router.get('/wishlist/:userEmail',  async (req, res) => {

  try {
    userEmail = req.params.userEmail
    // Find the cart for the user
    const cart = await Wishlist.findOne({userEmail})

    if (!cart) {
      return res.status(400).json({ success: false, message: 'Wishlist not found' });
    }
 
    res.status(200).json({
      success: true,
      message: `User's wishlist :`,
      data: { 
        cart, 
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Backend Server error : ', error });

  }

});


// //getbyID
// router.get('/wishlist/:userId/:wishlistId', verifyUserToken, async (req, res) => {

//   try {
//   const   userId = req.params.userId ;
//   const   wishlistId = req.params.wishlistId
   
//     // const wishlist = await Wishlist.findById({_id :wishlistId , userId : userId})
//     const wishlist = await Wishlist.findById({ _id: wishlistId, userId: userId });


//     if (!wishlist) {
//       return res.status(400).json({ success: false, message: 'Wishlist not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: `User's  Wishlist:`,
//       data: { 
//         wishlist
//       }
//     });

//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ success: false, error: 'Server error' });

//   }

// });

module.exports = router;
