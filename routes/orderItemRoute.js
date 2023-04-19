

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Cart = require("../model/cartModel");
const OrderItem = require('../model/orderItem');
const Purchase = require("../model/purchaseModel")
const { verifyUserToken } = require('../middleware/token');



//Create OrderItem
router.post('/orederitem', verifyUserToken, async (req, res) => {

    const { name, decription, price, quantity, } = req.body;

    try {
        


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, messzge: `Server Error`, data: error })
    }

});




module.exports = router;