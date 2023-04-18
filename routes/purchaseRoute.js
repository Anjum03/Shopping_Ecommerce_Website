

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Purchase = require("../model/purchaseModel");
const OrderItem = require('../model/orderItem');
const { verifyAdminToken, isAdmin, verifyUserToken } = require('../middleware/token');




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
router.post('/purchase', verifyAdminToken, isAdmin, verifyUserToken, async (req, res) => {

  try {

    const orderItems = req.body.orderItem;
    const orderItemIds = [];
    const totalPrices = [];

    // Create and save new OrderItems to database
    for (let i = 0; i < orderItems.length; i++) {
      let newOrderItem = new OrderItem({
        quantity: orderItems[i].quantity,
        category: orderItems[i].category
      });

      newOrderItem = await newOrderItem.save();
      orderItemIds.push(newOrderItem._id);

      const orderItem = await OrderItem.findById(newOrderItem._id)
        .populate({
          path: 'category',
          populate: {
            path: 'products',
            populate: {
              path: 'price'
            }
          }
        });

      if (!orderItem || !orderItem.category || !orderItem.category.products || orderItem.category.products.length === 0) {
        continue;
      }

      const price = orderItem.category.products[0].price;
      const quantity = newOrderItem.quantity;
      const totalPrice = price * quantity;
      totalPrices.push(totalPrice);
    }

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    // Create a new purchase record
    const purchase = new Purchase({
      orderItem: orderItemIds,
      Address: req.body.Address,
      phone: req.body.phone,
      totalPrice: totalPrice,
      user: req.body.user,
      dateOrder: req.body.dateOrder
    });

    // Save new purchase record to database
    await purchase.save();

    // Send response with new purchase record
    res.status(201).json({ success: true, message: 'Purchase record created successfully', data: purchase });
  } catch (error) {
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