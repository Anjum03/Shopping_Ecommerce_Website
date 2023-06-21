
require('dotenv').config();
const express = require('express');
const router = express.Router();
const Wishlist = require("../model/wishlistModel");
const Product = require("../model/userProductModel");
// const OrderItem = require("../model/orderItemModel");
const { verifyUserToken, } = require('../middleware/token');


//create cart
router.post('/wishlist', verifyUserToken, async (req, res) => {

  try {
    const { productId, quantity,userId } = req.body;

    // Get the product details from the database
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    //if user have wishlist
    const existWishlist = await Wishlist.findOne( {userId, productId})

    if(existWishlist){
      existWishlist.quantity += quantity ,
      existWishlist.price = product.totalPrice * existWishlist.quantity

      await existWishlist.save()

      res.status(200).json({success : true , message : `Quantity Added` , data : existWishlist})
    }
 else{

   const newWishlist = await Wishlist.create({
     userId: userId,
     productId: productId,
     quantity: quantity,
     price:product.totalPrice, // Assuming the price is the first material's price
     img: product.thumbs,
     productName: product.name
   });

   res.status(200).json({ success: true, message: 'Existing product added to wishlist', data:newWishlist});
  
 }

  }
  catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Backend Server Error : ', error });
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
router.delete('/wishlist/:wishlistId', verifyUserToken, async (req, res) => {
  const wishlistId = req.params.wishlistId;

  try {

    // Find the cart for the current user
    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }
    
    // const existWishlist = await Wishlist.find( wishlist.userId)
    const existWishlist = await Wishlist.findOne({ userId: wishlist.userId, productId: wishlist.productId });

    if(existWishlist){
      existWishlist.quantity -= wishlist.quantity ,
      existWishlist.price = wishlist.productId.totalPrice * existWishlist.quantity

await existWishlist.save()

      res.status(200).json({success : true , message : `Quantity remove` , data : existWishlist})
    } 
    await Wishlist.findByIdAndDelete(wishlistId);

    res.status(200).json({ success: true, message: 'Wishlist item deleted', data: wishlist });
    
   

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Backend Server error : ' + error });
  }
});



//get Cart 
router.get('/wishlist/:userId', verifyUserToken, async (req, res) => {

  try {
    userId = req.params.userId
    // Find the cart for the user
    const cart = await Wishlist.findOne({userId})

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


//getbyID
router.get('/wishlist/:userId/:wishlistId', verifyUserToken, async (req, res) => {

  try {
  const   userId = req.params.userId ;
  const   wishlistId = req.params.wishlistId
   
    // const wishlist = await Wishlist.findById({_id :wishlistId , userId : userId})
    const wishlist = await Wishlist.findById({ _id: wishlistId, userId: userId });


    if (!wishlist) {
      return res.status(400).json({ success: false, message: 'Wishlist not found' });
    }

    res.status(200).json({
      success: true,
      message: `User's  Wishlist:`,
      data: { 
        wishlist
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });

  }

});

module.exports = router;
