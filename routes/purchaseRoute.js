

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Purchase = require("../model/purchaseModel");
const { verifyAdminToken, isAdmin, verifyUserToken } = require('../middleware/token');
const Cart = require("../model/cartModel");



//purchase order all record 
router.get('/purchase',verifyUserToken,verifyAdminToken ,async (req, res) => {
  try {
    const purchases = await Purchase.find({}).populate('items.productId');
    if (!purchases) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Purchase and associated product and category retrieved successfully',
      data: purchases,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});



//create purchase order record
router.post('/purchase', verifyUserToken, async (req, res) => {

  try {

    userId = req.user._id;
    //get user's cart
    const cart = await Cart.findOne(userId).populate('items.productId');
    if (!cart) {
      // handle the case where the cart is not found
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item to be purchased
    const productId = req.body.productId;
    const item = cart.items.find((item) => item.productId._id.toString() === productId);

    if (!item) {
      return res.status(400).json({ success: false, message: 'Item not found in cart' });
    }

    // Check if the quantity is a valid number
    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    // Calculate the total price of the item
    const totalPrice = quantity * item.productId.totalPrice;

    // Check if the item has already been purchased
    const existingPurchase = await Purchase.findOne({
      userId,
      'items.productId._id': item.productId._id,
    });

    if (existingPurchase) {
      // Update the existing purchase with a new entry for the purchased quantity
      existingPurchase.items.push({ productId: item.productId, quantity: quantity });
      existingPurchase.totalPrice += totalPrice;
      await existingPurchase.save();

      
      // Remove the purchased item from the cart
      cart.items = cart.items.filter((cartItem) => cartItem._id.toString() !== item._id.toString());

      await cart.save();

      res.status(200).json({
        success: true, message: 'Purchase updated', data: {
          purchase: existingPurchase,
          remainingQuantity: remainingQuantity,
          remainingTotalPrice: remainingTotalPrice,
        }
      });
    } else {
      
      // Create a new order item
      // Create a new purchase record
      const purchase = new Purchase({
        userId: req.user._id,
        items: [{
          productId: productId,
          quantity: quantity,
        }],
        totalPrice: totalPrice,
        createdAt: new Date(),
      });

      await purchase.save();

      // Remove the purchased item from the cart
      cart.items = cart.items.filter((cartItem) => cartItem._id.toString() !== item._id.toString());


      // Save the changes to the cart
      await cart.save();

      // Update the purchased quantity and total price in the cart
      item.quantity -= quantity;
      cart.totalPrice -= totalPrice;

      // Calculate the remaining quantity and total price of the item in the cart
      const remainingQuantity = item.quantity;
      const remainingTotalPrice = remainingQuantity * item.productId.totalPrice;

      // Remove the item from the cart if the purchased quantity is equal to the cart quantity
      // if (item.quantity === 0) {
      //   cart.items = cart.items.filter((cartItem) => cartItem._id.toString() !== item._id.toString());
      // }

      // await cart.save();

      res.status(200).json({
        success: true, message: `Purchase Created...`, data: {
          purchase: purchase,
          remainingQuantity: remainingQuantity,
          remainingTotalPrice: remainingTotalPrice,
        }
      });
    }
  }

  catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Server Error`, data: error });
  }
});



//purchase order record update by ID
router.put('/purchase/:id', verifyAdminToken, isAdmin, verifyUserToken, async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status
      },
      { new: true }
    )

    await purchase.save();

    res.status(200).json({
      success: true,
      message: 'Purchase record and Product updated successfully',
      data: { purchase },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});



//delete purchase order record
router.delete('/purchase/:id', verifyAdminToken, isAdmin, verifyUserToken, async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).send();
    }
    return res.status(200).json({ success: true, message: 'The order is deleted!' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});



//total Sales
router.get('/purchase/totalSale', verifyAdminToken, isAdmin, async (req, res) => {
  try {

    const totalSales = await Purchase.aggregate([

      { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } },

    ]);

    if (!totalSales) {
      return res.status(400).json({ success: false, message: `The order sales cannot be generated` });
    }

    res.status(200).json({
      success: true,
      message: 'Total Sales retrieved successfully',
      data: { totalsales: totalSales.pop().totalsales },
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }

});



// //order Count
router.get('/purchase/count',verifyAdminToken, isAdmin, async (req, res) => {

  try {

    const orderCount = await Purchase.countDocuments()

    if (!orderCount) {
      res.status(500).json({ success: false, message: `Order Coun not Found....` })
    }

    res.status(200).json({ success: true, message: `Total Order Count `, data: orderCount })

  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }

})



// //purchase order by id record 
router.get('/purchase/:id', verifyAdminToken, isAdmin, verifyUserToken, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('items.productId');
    if (!purchase) {
      return res.status(404).send();
    }

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Purchase and associated product and category retrieved successfully',
      data: purchase,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});



//user history
router.get('/purchase/userOrder/:usersId', verifyUserToken, verifyAdminToken, isAdmin, async (req, res) => {
  try {
    const userOrderList = await Purchase.find({ user: req.params.usersId })
      .populate({
        path: 'orderItem', populate: [
          { path: 'category', populate: { path: 'products' } }
        ]
      })
      .sort({ 'dateOrder': -1 });
    if (!userOrderList) {
      return res.status(404).json({ message: ' userOrderList not found' });
    }

    res.status(200).json({
      success: true,
      message: ' userOrderList of Purchase and associated product and category retrieved successfully',
      data: userOrderList,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;