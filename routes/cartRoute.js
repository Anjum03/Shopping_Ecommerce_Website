

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const { verifyUserToken, } = require('../middleware/token');


//create cart
router.post('/cart', verifyUserToken, async (req, res) => {
  try {   
    const { productId, quantity , userId} = req.body;

    // Get the product details from the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const cart = await Cart.findOne({ userId: userId }); // search cart by userId instead of token
    if (!cart) {
      // If cart doesn't exist for the user, create a new cart
      const newCart = new Cart({
        userId: userId,
        token: req.token,
        items: [
          {
            productId: productId,
            quantity: quantity,
            price: product.discountedPrice 
          }
        ],
        totalPrice: product.discountedPrice * req.body.quantity,
      });
      await newCart.save();
      res.status(200).json({ success: true, message: 'New product added to cart', data: { cart: newCart, userId: userId } });
    } else {
      // If cart already exists for the user, update the cart with the new product and quantity
      if (cart.token !== req.token) {
        // If the token belongs to a different user, create a new cart
        const newCart = new Cart({
          userId: userId,
          token: req.token,
          items: [
            {
              productId: productId,
              quantity: quantity,
              price: product.discountedPrice 
            }
          ],
          totalPrice: product.discountedPrice * req.body.quantity,
        });
        await newCart.save();
        res.status(200).json({ success: true, message: 'New product added to cart', data: { cart: newCart, userId: userId } });
      } else {
        // If the token belongs to the same user, update the existing cart
        if (cart.items.find(item => item.productId.equals(productId))) {
          const existingItem = cart.items.find(item => item.productId.equals(productId));
          existingItem.quantity += req.body.quantity;
        } else {
          const newItem = {
            productId,
            quantity,
            price: product.discountedPrice ,
          };
          cart.items.push(newItem);
        }
        let totalPrice = 0;
        for (let i = 0; i < cart.items.length; i++) {
          const item = cart.items[i];
          // const product = await Product.findById(item.productId);
          totalPrice += product.price * item.quantity;
        }
        cart.totalPrice = totalPrice;
        await cart.save();
        res.status(200).json({ success: true, message: 'New product added to cart', data: { cart: cart, userId: userId } });
      }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Server Error', data: error });
  }
});



//update Cart
router.put('/cart/:id', verifyUserToken, async (req, res) => {

  const { id } = req.params;
  const { quantity } = req.body;

  try {

    //check if the user has access to the cart ==--- current user
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Check if the item exists in the cart
    const cartItem = cart.items.find(item => item._id.equals(id));
    if (!cartItem) {
      return res.status(400).json({ success: false, message: 'Item not found in cart' });
    }

    // Update the item quantity and prices
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(400).json({ success: false, message: 'Product not found' });
    }

    const oldQuantity = cartItem.quantity;
    const newQuantity = quantity;
    cartItem.quantity = newQuantity;

    cart.totalPrice = cart.totalPrice - (product.price * oldQuantity) + (product.price * newQuantity);

    // Save the changes to the cart
    const updateCart = await cart.save();
    res.status(200).json({ success: true, message: 'Cart Updated SuccessFully', data: { updateCart } });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }

});



//delete Cart
router.delete('/cart/:id', verifyUserToken, async (req, res) => {

  const itemId = req.params.id;
  const userId = req.user.id;

  try {

    // Find the cart for the current user
    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(item => item._id.equals(itemId));
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // Remove the item from the cart
    cart.items.pull(itemId);

    // Recalculate the total price of the cart
    const product = await Product.findById(item.productId);
    cart.totalPrice -= product.price * item.quantity;
     
    // Save the changes to the cart
    const deleteCart = await cart.save();

    res.status(200).json({ success: true, message: 'Delete Cart', data: deleteCart });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }

});



//get Cart 
router.get('/cart', verifyUserToken, async (req, res) => {

  try {

      // Check if req.user exists
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
console.log(req.user);
    // Find the cart for the user
    const cart = await Cart.findOne({ userId: req.user._id })
    console.log(cart);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Cart not found' });
    }

    const items = [];
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = await Product.findById(item.productId);
      if (product) {
        items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        });
      }
    }

    res.status(200).json({ success: true, message: `All Cart Here ..`, data: { items, totalPrice: cart.totalPrice } });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });

  }

});

module.exports = router;

