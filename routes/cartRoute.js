

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Cart = require("../model/cartModel");
const OrderItem = require('../model/orderItem');
const Purchase = require("../model/purchaseModel")
const { verifyUserToken } = require('../middleware/token');

//Create Cart
router.post('/cart', verifyUserToken, async (req, res) => {

  const { productId, name, description, price, quantity } = req.body;

  try {

    // ----odereItem Logic Start ---
    //create new orderitem 
    const orderItem = new OrderItem({
      productId, name, description, price, quantity 
    });
    
    await orderItem.save();

    //--------User logic ---------- 
    // find the cart for the current user
    const  cart = await Cart.findOne({ userId: req.user._id })

    if(!cart){
      //Create a new cart if user doesn't have one
      const newCart = new Cart({
        userId: req.user._id,
        orderItems:[orderItem]
      });
      await newCart.save();
    } else {
      //Add order item to user's existing cart
      cart.orderItems.push(orderItem);
      await cart.save();
    }
    // Output all details of orderitem and userid in the response
    const userId = req.user._id;
    const orderItemId = orderItem._id;

    res.status(201).json({ success: true, message: 'Item added to cart', data: {  userId: userId, 
        orderItemId: orderItemId, 
        cart: cart  } });
  
  }  catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
})



//update Cart
router.put('/cart/:itemId', verifyUserToken, async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {

    //check if the user has access to the cart ==--- current user
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

   // Find the item in the cart and update the quantity
    const itemIndex = cart.orderItems.findIndex((item) => item.item._id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.orderItems[itemIndex].quantity = quantity;

    //Save the updated cart to the database
    await cart.save();

    console.log(cart);
    res.status(200).json({ success: true, message: 'Cart Updated SuccessFully', data: { cart } });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });
  }

});



//delete Cart
router.delete('/cart/:itemId', verifyUserToken, async (req, res) => {

  const { itemId } = req.params;

  try {

    // Find the cart for the current user
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find the item in the cart and remove it
    const itemIndex = cart.orderItems.findIndex((item) => item.item._id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.orderItems.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ success: true, message: 'Delete Cart', data: cart });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });

  }

});



//get Cart 
router.get('/cart', async (req, res) => {

  try {

    const allCart = await Cart.find();
    res.status(200).json({ success: true, message: `All Cart Here ..`, data: allCart });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });

  }

});



//get by id
router.get('/cart/:id', async (req, res) => {

  try {

    const getByIdCart = await Cart.find(req.params.id);
    res.status(200).json({ success: true, message: `All Cart Here ..`, data: getByIdCart });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });

  }

});



module.exports = router;

