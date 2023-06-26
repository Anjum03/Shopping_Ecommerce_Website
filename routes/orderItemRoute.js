

require('dotenv').config();
const express = require('express');
const router = express.Router();
const OrderItem = require('../model/orderItemModel')
const Purchase = require('../model/purchaseModel')
const { verifyUserToken, verifyAdminToken, isAdmin } = require('../middleware/token');


/* This code defines a GET route for retrieving a specific order item by its purchase ID. The purchase
ID is passed as a parameter in the URL (`/orderitem/:purchaseId`). The function then uses
`OrderItem.findById()` to find the order item with the given purchase ID and returns it as a JSON
response. If the order item is not found, it returns a 404 error. If there is an error with the
server, it returns a 500 error. */
router.get('/orderitem/:purchaseId', async (req, res) => {
  try {
    const purchaseId = req.params.purchaseId;
    const orderItemData = await OrderItem.findOne({purchaseId : purchaseId});

    if (!orderItemData) {
      return res.status(404).json({ success: false, message: 'OrderItem  not found' });
    }

    res.status(200).json({ success: true, message: 'OrderItem item of specific User ', data: orderItemData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});



// // Create a new order item
// router.post('/', verifyAdminToken, async (req, res) => {
//   try {
//     const orderItem = new OrderItem(req.body);
//     await orderItem.save();
//     res.status(201).send(orderItem);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// Get all order items
router.get('/orderitem', async (req, res) => {
  try {
    const orderItems = await OrderItem.find({});
    res.send(orderItems);
  } catch (error) {
    res.status(500).send();
  }
});



// Get a specific order item by ID
router.get('/orderitem/:id', async (req, res) => {
  try {
    const orderItem = await OrderItem.findById(req.params.id);
    if (!orderItem) {
      return res.status(404).send();
    }
    res.send(orderItem);
  } catch (error) {
    res.status(500).send();
  }
});



// Update a specific order item by ID
router.put('/orderitem/:id', async (req, res) => {
  try {
    const { orderItemId } = req.params;
    const orderItem = await OrderItem.findById(orderItemId);
    if (!orderItem) {
      return res.status(404).json({ success: false, msg: `orderItem not found` });

    }
    if (order.orderStatus === "Delivered") {
      return res.status(404).json({ success: false, msg: `You have already delivered this order` });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
    orderItem.price = req.body.price,
      orderItem.quantity = req.body.quantity,
      res.send(orderItem);
  } catch (error) {
    res.status(500).send();
  }
});


// Delete a specific order item by ID
router.delete('/orderitem/:id', async (req, res) => {
  try {
    const orderItem = await OrderItem.findByIdAndDelete(req.params.id);
    if (!orderItem) {
      return res.status(404).send();
    }
    res.send(orderItem);
  } catch (error) {
    res.status(500).send();
  }
});













module.exports = router;
