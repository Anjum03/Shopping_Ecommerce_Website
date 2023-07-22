// 

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Purchase = require("../model/purchaseModel");
const OrderItem = require("../model/orderItemModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { verifyAdminToken, isAdmin, verifyUserToken } = require('../middleware/token');
const User = require('../model/userModel');
const Product = require('../model/userProductModel')


router.post('/purchaseCash', async (req, res) => {
  try {
    const { email, productId, quantity , currencyType } = req.body;

    // Find the user in your registered user database based on the email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const userId = user._id;

    // Check if the quantities are valid numbers
    const quantitiesArray = quantity.map(qty => parseInt(qty));
    if (quantitiesArray.some(qty => isNaN(qty) || qty <= 0)) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    // Create a new purchase record for each product
    const newPurchases = [];

    for (let i = 0; i < productId.length; i++) {
      const prodId = productId[i];
      const prodQuantity = quantitiesArray[i];

      // Find the corresponding product based on the productId
      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const newPurchase = new Purchase({
        userId: userId,
        productId: prodId,
        productName: product.name,
        quantity: prodQuantity,
        productPrice: product.totalPrice,
        paymentMode: 'cash on Demand',
        status: 'success',
        totalPrice: product.totalPrice * prodQuantity,
        deliveredAt: new Date(),
      });

      await newPurchase.save();
      newPurchases.push(newPurchase);
    }

    const newOrderItems = [];
    for (let i = 0; i < productId.length; i++) {
      const prodId = productId[i];
      const prodQuantity = quantitiesArray[i];
    
      // Find the corresponding product based on the productId
      const product = await Product.findById(prodId);
    
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    
      let price;
      let realPrice; // Variable to store the real price in USD or Pound
    
      switch (currencyType) {
        case 'usd':
          price = product ? product.usdTotalPrice * prodQuantity : NaN;
          realPrice = product ? product.usdTotalPrice : NaN;
          break;
        case 'gbp':
          price = product ? product.poundTotalPrice * prodQuantity : NaN;
          realPrice = product ? product.poundTotalPrice : NaN;
          break;
        default:
          price = product ? product.totalPrice * prodQuantity : NaN;
          realPrice = product ? product.totalPrice : NaN;
          break;
      }
      console.log(`realprice, ${realPrice}`)
    
      const newOrderItem = {
        purchaseId: newPurchases[i]._id,
        productId: newPurchases[i].productId,
        productName: newPurchases[i].productName,
        quantity: newPurchases[i].quantity,
        price: realPrice,
        totalPrice: !isNaN(parseFloat(price)) ? parseFloat(price) : 0,
        currency: currencyType, // Include the currencyType in the orderItem
      };
      newOrderItems.push(newOrderItem);
    }
    
    // Calculate the allProductTotalPrice
    const allProductTotalPrice = newOrderItems.reduce((accumulator, item) => accumulator + parseFloat(item.totalPrice), 0);
    
    // Create a new order item
    const orderItem = new OrderItem({
      userId,
      items: newOrderItems,
      allProductTotalPrice,
      paymentMode: newPurchases[0].paymentMode,
      status: newPurchases[0].status,
      deliveredAt: new Date().toISOString().split('T')[0],
    });

    // Save the order item to the database
    const savedOrderItem = await orderItem.save();

    res.status(200).json({
      success: true,
      message: 'Purchase created',
      data: {
        orderItem: savedOrderItem,
        purchases: newPurchases,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Server Error: ${error}` });
  }
});




// Purchase route
router.post('/purchase', async (req, res) => {
  try {
    const { customer_Id, card_Token , currencyType } = req.body;

    // Retrieve the Stripe customer details using the customer_Id
    const customer = await stripe.customers.retrieve(customer_Id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const userEmail = customer.email;

    // Find the user in your registered user database based on the email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const userId = user._id;

    const { productName, productImages, productPrice, quantity, productId, realPrice } = customer.metadata;
    const customerRealPrice = customer.metadata.realPrice ;
    console.log(`price : ${customer.metadata.realPrice}`)


    const productIdsArray = productId.split(',');
    const quantitiesArray = quantity.split(',');

    const selectedCurrency = currencyType;
   
    // Create a new source for the customer
    const card = await stripe.customers.createSource(customer_Id, {
      source: card_Token,
    });

    // Find the existing purchases for the user
    const purchases = await Purchase.find({ userId: userId, status: 'success' });

    // Create new purchases for each product
    const newPurchases = [];

    for (let i = 0; i < productIdsArray.length; i++) {
      const prodId = productIdsArray[i];
      const prodQuantity = quantitiesArray[i];

      // console.log('productPrice:', productPrice);
      // console.log('prodQuantity:', prodQuantity);

      // Find the corresponding product based on the productId
      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Create a new purchase
      const newPurchase = new Purchase({
        userId,
        productId: prodId,
        quantity: prodQuantity,
        productName  ,
        price: parseInt(productPrice),
        paymentMode: 'card',
        status: 'pending',
      });

      // Save the new purchase to the database
      const savedPurchase = await newPurchase.save();
      newPurchases.push(savedPurchase);
      // newPurchases.push(savedPurchase);
    }

    // Update the customer's metadata with the purchaseIds
    const purchaseIds = newPurchases.map((purchase) => purchase._id.toString());
    const updatedMetadata = { ...customer.metadata, purchaseId: purchaseIds.join(',') };
    await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

    const parsedProductPrice = parseInt(productPrice);
    const parsedQuantity = parseInt(quantity);
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({  //usd, cad,pound -->currency types 
      amount: parsedProductPrice * parsedQuantity * 100, // Multiply by quantity and 100 to convert to cents
      currency: selectedCurrency, 
      customer: customer_Id,
      payment_method: card.id,
      off_session: true,
      confirm: true,
    });

    // Update the purchase status based on the payment intent status
 // Update the purchase statuses based on the payment intent status
    for (const purchase of newPurchases) {
      purchase.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';
      await purchase.save();
    }

    // Save the updated purchase to the database
    // const savedPurchase = await newPurchase.save();
      // newPurchases.push(savedPurchase);

    // Create new order items
    const newOrderItems = [];

    for (let i = 0; i < productIdsArray.length; i++) {
      const prodId = productIdsArray[i];
      const prodQuantity = quantitiesArray[i];

      // Find the corresponding product based on the productId
      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      

      const newOrderItem = {
        purchaseId: newPurchases[i]._id,
        productId: prodId,
        productName : productName.split(',')[i] ,
        quantity: parseInt(prodQuantity),
        currency: selectedCurrency,
        price: parseInt(customerRealPrice.split(',')[i]), // Use the corresponding price from the realPrice array
        totalPrice: parseInt(customerRealPrice.split(',')[i]) * parseInt(prodQuantity),
      };
    console.log(`orderitem real price ${newOrderItem.price}`);

      newOrderItems.push(newOrderItem);
    }

    // Calculate the allProductTotalPrice
    const allProductTotalPrice = newOrderItems.reduce((accumulator, item) => accumulator + parseFloat(item.totalPrice), 0);

    
//     let  deliveredAt =  new Date();

// let date_ob = new Date(deliveredAt);
// let date = date_ob.getDate();
// let month = date_ob.getMonth() + 1;
// let year = date_ob.getFullYear();

// // prints date & time in YYYY-MM-DD format
// console.log(date + "-" + month + "-" + year);

    // Create a new order item
    const orderItem = new OrderItem({
      userId,
      items: newOrderItems,
      allProductTotalPrice,
      paymentMode: newPurchases[0].paymentMode,
      status: newPurchases[0].status,
      // deliveredAt: date + "-" + month + "-" + year ,  // Convert to ISO string and extract the date part
      deliveredAt: new Date().toISOString().split('T')[0],
    });

    // Save the order item to the database
    const savedOrderItem = await orderItem.save();

    return res.status(200).json({
      success: true,
      message: 'Purchase created, Payment Successful',
      data: {
        orderItem: savedOrderItem,
        purchases: newPurchases,
        customer,
      },
      paymentStatus: newPurchases[0].status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `Backend Server Error: ${error}` });
  }
});



//purchase order all record 
router.get('/purchase', async (req, res) => {
  try {
    const purchases = await Purchase.find({})
    if (!purchases) {
      return res.status(404).json({ message: 'Purchase not found' }); 
    }

    res.status(200).json({
      success: true,
      message: 'Purchase and associated product and category retrieved successfully',
      data: purchases,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
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
    return res.status(200).json({ success: true, message: 'The puchased items is deleted!' });
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
router.get('/purchase/count', verifyAdminToken, isAdmin, async (req, res) => {

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
// router.get('/purchase/userOrder/:userId', verifyUserToken, verifyAdminToken, isAdmin, async (req, res) => {
//   try {
//     userId = req.user._id;
//     //get user's cart
//     const userOrderList = await Purchase.findOne(userId)
//       .populate('items.productId')
//       .sort({ 'dateOrder': -1 });
//     if (!userOrderList) {
//       return res.status(404).json({ message: 'No purchase history found for this user' });
//     }

//     res.status(200).json({
//       success: true,
//       message: ' userOrderList of Purchase and associated product and category retrieved successfully',
//       data: userOrderList,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


module.exports = router;