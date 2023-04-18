

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Cart = require("../model/cartModel");
const OrderItem = require('../model/orderItem');
const { verifyUserToken } = require('../middleware/token');
const mongoose = require('mongoose');

//Create Cart
router.post('/cart', verifyUserToken, async (req, res) => {

  try {

    const { itemIds, quantities, userId } = req.body;

    // find the user's cart
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'orderItems.item',
      populate: {
        path: 'category',
        populate: {
          path: 'products',
          populate: {
            path: 'price'
          }
        },
        options: { strictPopulate: false } // Add this line
      }
    });

    console.log('cart:', cart);

    if (!cart ) {
      // if the user doesn't have a cart, create a new one
      cart = new Cart({ user: userId, orderItems: [] });
    }

    console.log('cart.orderItems:', cart.orderItems);

    if (!cart.orderItems) {
      // if the cart does not have orderItems, initialize it to an empty array
      cart.orderItems = [];
    }

    if (!itemIds || itemIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    // loop through the array of itemIds to add items to the cart
    for (let i = 0; i < itemIds.length; i++) {
      const itemId = itemIds[i];
      const quantity = quantities[i];

      // check if itemId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ success: false, message: 'Invalid item id' });
  }


      // // find the order item for the given item id 
      let orderItem = await OrderItem.findById(itemId).populate({
        path: 'category',
        populate: {
          path: 'products',
          populate: {
            path: 'price'
          }
        },
        options: { strictPopulate: false }
      });

      // Check if the order item or its category or products are not found
      if (!orderItem || !orderItem.category || !orderItem.category.products || !orderItem.category.products.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Item not found`
        });
      }

      let existingOrderItem = cart.orderItems.find(item => item.item && item.item.toString() === itemId);

      if (existingOrderItem) {
        // if the item exists, update its quantity in the database
        const newQuantity = existingOrderItem.quantity + quantity;
        await OrderItem.findOneAndUpdate(
          { _id: orderItemToUpdate.item },
          { $set: { quantity: newQuantity } },
          { new: true }
        );

       // update the quantity of the order item in the cart
orderItemToUpdate.quantity = newQuantity;

        // recalculate the total price of the cart
cart.totalPrice = cart.orderItems.reduce((total, item) => {
  return total + item.quantity * item.item.price;
}, 0);
      } else {
        // if the item does not exist, create a new order item and add it to the cart
        const newOrderItem = new OrderItem({
          quantity: quantity,
          category: orderItem.category
        });

        await newOrderItem.save();
        cart.orderItems.push({ item: newOrderItem._id, quantity: quantity });
        cart.totalPrice += quantity * orderItem.category.products[0].price;
      }
    }

    // 
    // const newOrderItem = new OrderItem({
    //   quantity: req.body.quantity,
    //   category: req.body.category // replace with the actual category ID or object
    // });

    // // find the user's cart
    // // const userId = req.user.id; // assuming the user ID is stored in req.user
    // let cart = await Cart.findOne({ user: userId });

    // if (!cart) {
    //   // if the user doesn't have a cart, create a new one
    //   cart = new Cart({ user: userId });
    // }

    //check exisitng item in db ?
    // const existingOrderItem = cart.orderItems.find(item => item.item.toString() === itemId);
    // if (existingOrderItem) {
    //   //if the item exists, update its quantiy
    //   existingOrderItem.quantity += quantity;
    //   cart.totalPrice += quantity * orderItem.category.products[0].price;
    // } else {
    //   //if the item not exists , add it to the cart,create a new order item and add it to the cart

    //   const newOrderItem = new OrderItem({
    //     quantity: quantity,
    //     category: orderItem.category
    //   });
    //   await newOrderItem.save();
    //   cart.orderItems.push({ item: newOrderItem._id, quantity: orderItem.quantity });
    //   cart.totalPrice += quantity * orderItem.category.products[0].price;
    // }

    // save the changes to the cart
    await cart.save();
    res.status(201).json({ success: true, message: 'Item added to cart successfully', data: { cart } })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

});



//update Cart
router.put('/cart/:id', verifyUserToken, async (req, res) => {

  try {

    const cartId = req.params.id;
    const userId = req.user._id;

    //check if the user has access to the cart
    const cart = await Cart.findOne({ _id: cartId, user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    //update the cart

    cart.orderItem = req.body.orderItem;
    cart.totalPrice = req.body.totalPrice;

    //Save the updated cart to the database
    const updatedCart = await cart.save();

    console.log(updatedCart);
    res.status(200).json({ success: true, message: 'Cart Updated SuccessFully', data: updatedCart });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: 'Server error' });

  }

});




//delete Cart
router.delete('/cart/:id', verifyUserToken, async (req, res) => {

  try {

    const cartId = req.params.id;
    const userId = req.user._id;

    //check if the user has access to the cart
    const cart = await Cart.findOne({ _id: cartId, user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    //Delete the orderItem
    const orderItemIds = cart.orderItem.map(item => item.item);
    await OrderItem.deleteMany({ _id: { $in: orderItemIds } });

    //Delete the cart 

    const deletedCart = await cart.deleteOne({ _id: cartId });

    res.status(200).json({ success: true, message: 'Delete Cart', data: deletedCart });

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

