

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Cart = require("../model/cartModel");


//Create Cart
//Create Cart
router.post('/cart',   async(req, res) => {

    const { userId, products } = req.body;
  
    // Check if the request body contains userId and products
    if (!userId || !products) {
      return res.status(400).json({
        success: false,
        error: 'Both userId and products are required.'
      });
    }
  
    // Check if products is an array
    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Products must be an array.'
      });
    }
  
    try {
      const cart = await Cart.findOne({ userId });
  
      if (cart) {
        // Cart exists for user, update the products
        products.forEach((product) => {
          const item = cart.products.find((p) => p.productId.toString() === product.productId);
  
          if (item) {
            // Product exists in cart, update the quantity
            item.quantity += product.quantity;
          } else {
            // Product does not exist in cart, add the product
            cart.products.push(product);
          }
        });
  
        await cart.save();
        res.status(200).json({ success: true, message: 'Cart updated successfully', data: cart });
      } else {
        // Cart does not exist for user, create a new cart
        const newCart = new Cart({ userId, products });
        const savedCart = await newCart.save();
        console.log(savedCart);
        res.status(200).json({ success: true, message: 'New Cart created successfully', data: savedCart });
      }
  
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error: 'Server error' });
    }
  
  });
  



//update Cart
router.put('/cart/id',   async(req, res)=>{

    try{

        const updatedCart = await Cart.findOneAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        console.log(updatedCart);
        res.status(200).json({ success: true, message: 'Update Cart', data: updatedCart });

    }catch(error){
        console.log(error)
        res.status(500).json({ success: false, error: 'Server error' });

    }

});




//delete Cart
router.delete('/cart/id',   async(req, res)=>{

    try{

        const deletedCart = await Cart.findOneAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Delete Cart', data: deletedCart });

    }catch(error){
        console.log(error)
        res.status(500).json({ success: false, error: 'Server error' });
  
    }

});



//get Cart 
router.get('/cart',   async(req, res)=>{

    try{

        const allCart = await Cart.find();
        res.status(200).json({ success: true, message:`All Cart Here ..` , data: allCart});


    }catch(error){
        console.log(error)
        res.status(500).json({ success: false, error: 'Server error' });
  
    }

});



module.exports = router ;

