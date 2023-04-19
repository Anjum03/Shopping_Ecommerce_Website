

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Purchase = require("../model/purchaseModel");
const OrderItem = require('../model/orderItem');
const { verifyAdminToken, isAdmin, verifyUserToken } = require('../middleware/token');
const Cart = require("../model/cartModel");



//purchase order all record 
router.get('/purchase', verifyAdminToken, isAdmin, async (req, res) => {
  try {
    const purchase = await Purchase.find()
      .populate('user', 'name')
      .sort({ 'dateOrder': -1 });
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



//create purchase order record
router.post('/purchase',  verifyUserToken, async (req, res) => {

  const { paymentMethod, shippingAddress } = req.body;
  try {
    
    // Find the user's cart
    const cart = await Cart.findOne({ userId: req.user._id })

    if (!cart) {
      res.status(404).send('Cart not found');
      return;
    }
    
    console.log('Cart:', cart);

    // Create and save a new purchase order record
    const totalPrice = cart.orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const purchase = new Purchase({
      userId: req.user._id,
      orderItems: cart.orderItems,
      totalPrice,
      paymentMethod,
      shippingAddress
    });
    await purchase.save();

    console.log('Purchase order:', purchase);

    // Update cart to remove purchased items
    const purchasedItems = purchase.orderItems.map(item => item._id);
    cart.orderItems = cart.orderItems.filter(item => !purchasedItems.includes(item._id));
    await cart.save();

    console.log('Cart after saving remove purchase Item :', cart);

    res.status(201).json({ success: true, message: 'Purchase order created', data: { purchaseOrder } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    const order = await Purchase.findOneAndDelete({ _id: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    await Promise.all(order.orderItem.map(async (orderItem) => {
      await OrderItem.findOneAndDelete({ _id: orderItem });
    }));
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
router.get('/purchase/count', async (req, res) => {

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
    const purchase = await Purchase.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'orderItem', populate: [

          { path: 'category', populate: { path: 'primeCollections' } },
          { path: 'category', populate: { path: 'products' } }
        ]
      })

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

          { path: 'category', populate: { path: 'primeCollections' } },
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