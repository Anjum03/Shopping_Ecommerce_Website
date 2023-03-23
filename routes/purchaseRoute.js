

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Purchase = require("../model/purchaseModel");
const Product = require('../model/productModel');
const Category = require('../model/categoryModel')
const { verifyToken, isAdmin } = require('../middleware/token');


//purchase order all record 
router.get('/purchase/:id', async (req, res) => {
    try {
      const purchase = await Purchase.findById(req.params.id).populate('product_id').populate('category_id');
      if (!purchase) {
        return res.status(404).json({ message: 'Purchase not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Purchase and associated product and category retrieved successfully',
        data: purchase,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


//create purchase oreder record
router.post('/purchase', verifyToken, async (req, res) => {

    try {
        const { user_id, product_id, category_id, quantity, total_price } = req.body;

    // Check if all required fields are provided
    if (!user_id || !product_id || !category_id || !quantity || !total_price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
        // Find the product and category
        const product = await Product.findById(product_id);
        const category = await Category.findById(category_id);

        // Check if product and category exist
        if (!product || !category) {
            return res.status(404).json({ message: 'Product or category not found' });
        }
        
    // Create a new purchase record
    const purchase = new Purchase({
        user_id,
        product_id,
        category_id,
        quantity,
        total_price,
        status: 'Pending'
      });

        // Save new purchase record to database
        await purchase.save();

        // Send response with new purchase record
        res.status(201).json({ success: true, message: 'Purchase record created successfully', data: purchase });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



//purchase order record update by ID
router.put('/purchase/:id', verifyToken, isAdmin, async (req, res) => {
    try {
      const { quantity, total_price, status, product_id, category_id } = req.body;
  
      const purchase = await Purchase.findById(req.params.id);
      if (!purchase) {
        return res.status(404).json({ message: 'Purchase not found' });
      }
  
      const product = await Product.findById(product_id);
      const category = await Category.findById(category_id);
      if (!product || !category) {
        return res.status(404).json({ message: 'Category or Product not found' });
      }
  
      purchase.quantity = quantity || purchase.quantity;
      purchase.total_price = total_price || purchase.total_price;
      purchase.status = status || purchase.status;
      purchase.product_id = product_id || purchase.product_id;
      purchase.category_id = category_id || purchase.category_id;
  
      await purchase.save();
  
      res.status(200).json({
        success: true,
        message: 'Purchase record and Product updated successfully',
        data: { purchase, product, category },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  


//delete purchase order record
router.delete('/purchase/:id', verifyToken, isAdmin, async (req, res) => {

    try {

        const purchase = await Purchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({ success: false, message: 'Purchase not found' })
        }

        await purchase.deleteOne({ _id: purchase._id });

        res.status(200).json({ success: true, message: `Purchase Record delete`, data: purchase });


    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;