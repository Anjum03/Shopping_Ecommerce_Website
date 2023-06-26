// 

require('dotenv').config();
const express = require('express');
const router = express.Router();
const Purchase = require("../model/purchaseModel");
const OrderItem = require("../model/orderItemModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { verifyAdminToken, isAdmin, verifyUserToken } = require('../middleware/token');
const User = require('../model/userModel')

// router.post('/source', async(req,res)=>{
//   try {
//     const { customer_Id, card_Token} = req.body;


//     const card = await stripe.customers.createSource(customer_Id, {
//       source: card_Token,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Created add-card successfully',
//       data:{  source :  card_Token.id    , 

//          card: card.id
//          }
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: 'Server Error', data: error });
//   }
// })



// //customerID
// router.post('/purchaseCustomer', async (req, res) => {
//   try {
//     const { customer_Id, cardId } = req.body;

//     const customer = await stripe.customers.retrieve(customer_Id);

//     if (!customer) {
//       return res.status(404).json({ success: false, message: 'Customer not found' });
//     }
//     const userEmail = customer.metadata.email;

//     // Find the user in your registered user database based on the email
//     const user = await User.findOne({ email: userEmail });

//     if (!user) {
//       return res.status(401).json({ success: false, message: 'User not logged in' });
//     }

//     const userId = user._id;

//     const { productName, productImages, productPrice, quantity, productId } = customer.metadata;


//     const purchase = new Purchase({
//       items: [
//         {
//           userId: userId,
//           productId: productId,
//           productName: productName,
//           productImages: productImages,
//           quantity: quantity,
//           price: productPrice,
//         },
//       ],
//       paymentMode: 'card',
//       status: 'pending',
//     });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: productPrice,
//       currency: 'CAD',
//       customer: customer_Id,
//       payment_method: cardId,
//       off_session: true,
//       confirm: true,
//     });

//     purchase.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';

//     if (customer.metadata.purchaseId) {
//       const existingPurchase = await Purchase.findById(customer.metadata.purchaseId);

//       if (!existingPurchase) {
//         return res.status(404).json({ success: false, message: 'Existing purchase not found' });
//       }

//       existingPurchase.items.push({
//         productId: productId,
//         productName: productName,
//         productImages: productImages,
//         quantity: quantity,
//         price: productPrice,
//       });

//       await existingPurchase.save();

//       let orderItem = await OrderItem.findOne({ purchaseId: customer.metadata.purchaseId });

//       if (!orderItem) {
//         return res.status(404).json({ success: false, message: 'Existing order item not found' });
//       }

//       orderItem.items.push({
//         purchaseId: customer.metadata.purchaseId,
//         productId: productId,
//         quantity: quantity,
//         price: productPrice,
//       });

//       orderItem.totalPrice += productPrice * quantity;

//       await orderItem.save();
//     } else {
//       await purchase.save();

//       const updatedMetadata = { ...customer.metadata, purchaseId: purchase._id.toString() };
//       await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

//       const orderItem = new OrderItem({
//         userId: userId, // Add the userId here if available
//         purchaseId: purchase._id.toString(),
//         items: [
//           {
//             purchaseId: purchase._id,
//             productId: productId,
//             quantity: quantity,
//             price: productPrice,
//           },
//         ],
//         totalPrice: productPrice,
//       });

//       await orderItem.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Purchase created, Payment Successful',
//       data: {
//         purchase: purchase,
//         customer: customer,
//       },
//       paymentStatus: purchase.status,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: 'Server Error', data: error });
//   }
// });




//add orderitem in pusrchase
//save in db and send in dev part cardId

router.post('/purchase', async (req, res) => {
  try {
    const { customer_Id, card_Token } = req.body;

    // Retrieve the Stripe customer details
    const customer = await stripe.customers.retrieve(customer_Id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const userEmail = customer.metadata.email;

    // Find the user in your registered user database based on the email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const userId = user._id;

    const { productName, productImages, productPrice, quantity, productId } = customer.metadata;

    // Create a new source for the customer
    const card = await stripe.customers.createSource(customer_Id, {
      source: card_Token,
    });

    // Find the existing purchase or create a new one
    let purchase = await Purchase.findOne({ userId: userId, status: 'success' });

    if (!purchase) {
      // Create a new purchase instance
      purchase = new Purchase({
        userId: userId,
        items: [],
        paymentMode: 'card',
        status: 'pending',
      });
    }

    // Add the new item to the purchase
    purchase.items.push({
      userId: userId,
      productId: productId,
      productName: productName,
      productImages: productImages,
      quantity: quantity,
      price: productPrice,
    });

    // Save the purchase to the database
    await purchase.save();

    // Update the customer's metadata with the purchaseId
    const updatedMetadata = { ...customer.metadata, purchaseId: purchase._id.toString() };
    await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

    // Find the existing order item or create a new one
    let orderItem = await OrderItem.findOne({ purchaseId: purchase._id });

    if (!orderItem) {
      // Create a new order item
      orderItem = new OrderItem({
        userId: userId,
        purchaseId: purchase._id.toString(),
        items: [],
        totalPrice: 0,
      });
    }

    // Add the new item to the order item
    orderItem.items.push({
      purchaseId: purchase._id,
      productId: productId,
      quantity: quantity,
      price: productPrice,
    });

    // Update the total price of the order item
    orderItem.totalPrice += productPrice * quantity;

    // Save the order item to the database
    await orderItem.save();

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: productPrice, // Multiply by 100 to convert to cents
      currency: 'CAD',
      customer: customer_Id,
      payment_method: card.id,
      off_session: true,
      confirm: true,
    });

    // Update the purchase status based on the payment intent status
    purchase.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';

    // Save the updated purchase to the database
    await purchase.save();

    return res.status(200).json({
      success: true,
      message: 'Purchase created, Payment Successful',
      data: {
        purchase: purchase,
        customer: customer,
      },
      paymentStatus: purchase.status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error', data: error });
  }
});





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
router.get('/purchase/userOrder/:userId', verifyUserToken, verifyAdminToken, isAdmin, async (req, res) => {
  try {
    userId = req.user._id;
    //get user's cart
    const userOrderList = await Purchase.findOne(userId)
    .populate('items.productId')
      .sort({ 'dateOrder': -1 });
      if (!userOrderList) {
        return res.status(404).json({ message: 'No purchase history found for this user' });
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