

require('dotenv').config();
const express = require('express');
const router = express.Router();
const OrderItem = require('../model/orderItemModel')


router.get('/orderitem/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orderItemData = await OrderItem.findOne({userId : userId});

    if (!orderItemData) {
      return res.status(404).json({ success: false, message: 'OrderItem  not found' });
    }

    res.status(200).json({ success: true, message: 'OrderItem item of specific User ', data: orderItemData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});



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
