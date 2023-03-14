

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Purchase = require("../model/purchaseModel");
const { verifyToken, isAdmin } = require('../middleware/token');


//purchase order all record 
router.get('/purchase', verifyToken, async (req, res) => {
    try {
        const purchase = await Purchase.find();
        console.log(purchase)
        res.status(200).json({ success: true, data: purchase });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//create purchase oreder record
router.post('/purchase', verifyToken, async(req,res)=>{

    try {

        const {user_id, item, quantity, total_price } = req.body;

        if (!user_id || !item || !quantity || !total_price) {
            return res.status(400).json({ message: 'Please provide all required fields' });
          }

          const purchase = new Purchase({
            user_id,
            item,
            quantity,
            total_price
          });

          await purchase.save();
          console.log( 'Purchase record created successfully')
          res.status(201).json({ success:true, message: 'Purchase record created successfully', data: purchase });        
    } catch (error) {
        console.error(error);
    res.status(500).json({success:false,  message: 'Internal server error' });
    }
});


//purchase order record update by ID
router.put('/purchase/:id', verifyToken,isAdmin, async (req, res) => {

    try {
        const purchase = await Purchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        // Update the purchase record with the new data
        purchase.item = req.body.item || purchase.item;
        purchase.quantity = req.body.quantity || purchase.quantity;
        purchase.total_price = req.body.total_price || purchase.total_price;
        purchase.status = req.body.status || purchase.status;

        await purchase.save();

        console.log('Purchase record updated successfully' )
        res.status(200).json({success:true,  message: 'Purchase record updated successfully', data:purchase});

    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
});


//delete purchase order record
router.delete('/purchase/:id', verifyToken,isAdmin, async (req, res) => {

    try {

        const purchase = await Purchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({success:false,  message: 'Purchase not found' })
        }

        await purchase.deleteOne();

        console.log(purchase)
        res.status(200).json({ success: true,message:`Purchase Record delete`, data: purchase });


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;