

require('dotenv').config();
const express = require('express');
const router = express.Router();
const OrderItem = require('../model/orderItem');
const { verifyUserToken, verifyAdminToken, isAdmin } = require('../middleware/token');



// Create a new order item
router.post('/', verifyUserToken , async (req, res) => {
  try {
    const orderItem = new OrderItem(req.body);
    await orderItem.save();
    res.status(201).send(orderItem);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all order items
router.get('/orderitem',verifyUserToken, verifyAdminToken, isAdmin, async (req, res) => {
    try {
      const orderItems = await OrderItem.find({});
      res.send(orderItems);
    } catch (error) {
      res.status(500).send();
    }
  });



  // Get a specific order item by ID
router.get('/orderitem/:id',verifyUserToken, verifyAdminToken, isAdmin, async (req, res) => {
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
router.put('/orderitem/:id',verifyUserToken, async (req, res) => {
    try {
        const {orderItemId} = req.params ;
      const orderItem = await OrderItem.findById(orderItemId);
      if (!orderItem) {
        return res.status(404).json({success: false, msg:`orderItem not found` });

      }
      orderItem.price = req.body.price,
      orderItem.quantity = req.body.quantity,
      res.send(orderItem);
    } catch (error) {
      res.status(500).send();
    }
  });


  // Delete a specific order item by ID
router.delete('/orderitem/:id', verifyUserToken,async (req, res) => {
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
