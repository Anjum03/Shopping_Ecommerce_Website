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


router.post('/source', async (req, res) => {
  try {
    const { customer_Id, card_Token } = req.body;


    const card = await stripe.customers.createSource(customer_Id, {
      source: card_Token,
    });

    res.status(200).json({
      success: true,
      message: 'Created add-card successfully',
      data: {
        source: card_Token.id,

        card: card.id
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error', data: error });
  }
})



// /purchaseCash route
router.post('/purchaseCash', async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;

    // Find the user in your registered user database based on the email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const userId = user._id;

    // Check if the quantity is a valid number
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    // Find the existing purchases for the user
    const purchases = await Purchase.find({ userId: userId, status: 'success' });

    // Create a new purchase record
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // const totalPrice = parseInt(product.price) * parseInt(quantity);

    const newPurchase = new Purchase({
      userId: userId,
      productId: productId,
      productName: product.name,
      quantity: quantity,
      productPrice: product.price,
      paymentMode: 'cash on Delivery',
      status: 'success',
      totalPrice: product.price * quantity,
      createdAt: new Date(),
    });

    await newPurchase.save();

    // Find or create the order item
    let orderItem = await OrderItem.findOne({ userId: userId });

    // if (!orderItem) {
      orderItem = new OrderItem({
        userId: userId,
        items: [
          {
            purchaseId: newPurchase._id,
            productId: productId,
            productName: product.name,
            productPrice: product.price,
            quantity: quantity,
            totalPrice: product.totalPrice * quantity,
          }
        ],
        paymentMode: 'cash on Demand',
        status: newPurchase.status,
        deliveredAt: new Date(),
      });
    // }

    // const newItem = {
    //   purchaseId: newPurchase._id,
    //   productId: productId,
    //   productName: product.name,
    //   quantity: quantity,
    //   price: product.price,
    //   totalPrice: product.totalPrice,
    //   paymentMode: newPurchase.paymentMode,
    //   status: newPurchase.status,
    //   deliveredAt: new Date(),
    // };

    // orderItem.items.push(newItem);

    // // Recalculate the allProductTotalPrice of the order item
    // orderItem.allProductTotalPrice = orderItem.items.reduce((total, item) => total + parseFloat(item.totalPrice), 0);

    await orderItem.save();

    res.status(200).json({
      success: true,
      message: 'Purchase created',
      data: {
        orderItem: orderItem,
        purchase: newPurchase,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server Error', data: error });
  }
});






// quantity increase in both

// router.post('/purchase', async (req, res) => {
//   try {
//     const { customer_Id, card_Token } = req.body;

//     // Retrieve the Stripe customer details
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

//     // Create a new source for the customer
//     const card = await stripe.customers.createSource(customer_Id, {
//       source: card_Token,
//     });

//     // Find the existing purchase for the user
//     let purchase = await Purchase.findOne({ userId: userId, status: 'success' });

//     if (purchase && purchase.productId.toString() === productId.toString()) {
//       // Increase the quantity of the existing product in the purchase
//       purchase.quantity += 1;
//     } else {
//       // Create a new purchase
//       purchase = new Purchase({
//         userId,
//         productName,
//         productId,
//         quantity,
//         price: productPrice,
//         paymentMode: 'card',
//         status: 'pending',
//       });
//     }

//     // Save the purchase to the database
//     const savedPurchase = await purchase.save();

//     // Update the customer's metadata with the purchaseId
//     const updatedMetadata = { ...customer.metadata, purchaseId: purchase._id.toString() };
//     await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

//     // Create a payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: productPrice * quantity * 100, // Multiply by quantity and 100 to convert to cents
//       currency: 'CAD',
//       customer: customer_Id,
//       payment_method: card.id,
//       off_session: true,
//       confirm: true,
//     });

//     // Update the purchase status based on the payment intent status
//     purchase.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';

//     // Save the updated purchase to the database
//     await purchase.save();

//     // Find or create the order item
//     let orderItem = await OrderItem.findOne({ userId: userId });

//     if (!orderItem) {
//       orderItem = new OrderItem({
//         userId: userId,
//         items: [
//           {
//             purchaseId: purchase._id,
//             productId: productId,
//             productName: productName,
//             quantity: quantity,
//             price: productPrice,
//             totalPrice: productPrice * quantity,
//           },
//         ],
//         paymentMode: 'card',
//         status: purchase.status,
//       });
//     } else {
//       // Check if the product already exists in the order item
//       const itemIndex = orderItem.items.findIndex(item => item.productId.toString() === productId);
//       if (itemIndex !== -1) {
//         // Increase the quantity of the existing product in the order item
//         orderItem.items[itemIndex].quantity += 1;
//         orderItem.items[itemIndex].totalPrice += productPrice * quantity;
//       } else {
//         // Add a new item to the order item
//         orderItem.items.push({
//           purchaseId: purchase._id,
//           productId: productId,
//           productName: productName,
//           quantity: quantity,
//           price: productPrice,
//           totalPrice: productPrice * quantity,
//         });
//       }
//     }

//     // Recalculate the allProductTotalPrice of the order item
//     // orderItem.allProductTotalPrice = orderItem.items.reduce((total, item) => total + item.totalPrice, 0);

//     // Save the order item to the database
//     await orderItem.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Purchase created, Payment Successful',
//       data: {
//         orderItem: orderItem,
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


//IT WORKS FOR MULTIPLE PRODUCTS
// router.post('/productPurchase', async (req, res) => {
//   try {
//     const { customer_Id, card_Token } = req.body;

//     // Retrieve the Stripe customer details
//     const customer = await stripe.customers.retrieve(customer_Id);

//     if (!customer) {
//       return res.status(404).json({ success: false, message: 'Customer not found' });
//     }

//     const userEmail = customer.email;
//     console.log(`email : ${customer.metadata.email}`);

//     // Find the user in your registered user database based on the email
//     const user = await User.findOne({ email: userEmail });

//     if (!user) {
//       return res.status(401).json({ success: false, message: 'User not logged in' });
//     }

//     const userId = user._id;

//     const { productPrice, quantity, productId } = customer.metadata;

//     const productIdsArray = productId.split(',');

//     // Create a new source for the customer
//     const card = await stripe.customers.createSource(customer_Id, {
//       source: card_Token,
//     });

//     // Find the existing purchases for the user
//     const purchases = await Purchase.find({ userId: userId, status: 'success' });

//     let purchaseExists = false;
//     let purchase;

//     for (const existingPurchase of purchases) {
//       if (productIdsArray.includes(existingPurchase.productId.toString())) {
//         existingPurchase.quantity += 1;
//         purchaseExists = true;
//         console.log('Purchase exists:', existingPurchase._id);
//         purchase = existingPurchase;
//         break;
//       }
//     }

//     if (!purchaseExists) {
//       console.log('Purchase does not exist');

//       // Create new purchases for each productId
//       const newPurchases = [];

//       for (const prodId of productIdsArray) {
//         // Find the corresponding product based on the productId
//         const product = await Product.findById(prodId);

//         if (!product) {
//           return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//         // Create a new purchase
//         const newPurchase = new Purchase({
//           userId,
//           productId: prodId,
//           quantity,
//           price: parseFloat(productPrice),
//           paymentMode: 'card',
//           status: 'pending',
//         });

//         // Save the new purchase to the database
//         const savedPurchase = await newPurchase.save();
//         newPurchases.push(savedPurchase);
//       }

//       // Use the first purchase for further processing
//       purchase = newPurchases[0];
//     }

//     // Update the customer's metadata with the purchaseId
//     const updatedMetadata = { ...customer.metadata, purchaseId: purchase._id.toString() };
//     await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

//     // Create a payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: parseFloat(productPrice) * quantity * 100, // Multiply by quantity and 100 to convert to cents
//       currency: 'CAD',
//       customer: customer_Id,
//       payment_method: card.id,
//       off_session: true,
//       confirm: true,
//     });

//     // Update the purchase status based on the payment intent status
//     purchase.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';

//     // Save the updated purchase to the database
//     await purchase.save();

//     // Find or create the order item
//     let orderItem = await OrderItem.findOne({ userId: userId });

//     if (!orderItem) {
//       console.log(`orderItem not present :       `);
//       orderItem = new OrderItem({
//         userId: userId,
//         items: [],
//         paymentMode: 'card',
//         status: purchase.status,
//       });
//     }

//     // Add or update the items in the order item
//     for (const prodId of productIdsArray) {
//       const existingItemIndex = orderItem.items.findIndex((item) => item.productId.toString() === prodId);

//       if (existingItemIndex !== -1) {
//         // Increase the quantity of the existing product in the order item
//         orderItem.items[existingItemIndex].quantity += 1;
//         orderItem.items[existingItemIndex].totalPrice += parseFloat(productPrice) * quantity;
//       } else {
//         // Find the corresponding product based on the productId
//         const product = await Product.findById(prodId);

//         if (!product) {
//           return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//         // Add a new item to the order item
//         orderItem.items.push({
//           purchaseId: purchase._id,
//           productId: prodId,
//           quantity: quantity,
//           price: parseFloat(productPrice),
//           totalPrice: parseFloat(productPrice) * quantity,
//         });
//       }
//     }

//     // Recalculate the allProductTotalPrice of the order item
//     orderItem.allProductTotalPrice = orderItem.items.reduce((total, item) => total + item.totalPrice, 0);

//     // Save the order item to the database
//     await orderItem.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Purchase created, Payment Successful',
//       data: {
//         orderItem: orderItem,
//         purchase: purchase,
//         customer: customer,
//       },
//       paymentStatus: purchase.status,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: `Backend Server Error: ${error}` });
//   }
// });


//new things 
router.post('/newPurchase', async (req, res) => {
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

    // Find the existing purchases for the user
    const purchases = await Purchase.find({ userId: userId, status: 'success' });

    let purchaseExists = false;
    let purchase
    
    // Create a new purchase
    const newPurchase = new Purchase({
      userId,
      productName,
      productId,
      quantity,
      price: productPrice,
      paymentMode: 'card',
      status: 'pending',
    });
    console.log('Purchase does not exist');

      // Save the new purchase to the database
      purchase = await newPurchase.save();
    

    // Update the customer's metadata with the purchaseId
    const updatedMetadata = { ...customer.metadata, purchaseId: purchase._id.toString() };
    await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: productPrice * quantity * 100, // Multiply by quantity and 100 to convert to cents
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



    // Find or create the order item
    let orderItem = await OrderItem.findOne({ userId: userId });

    // if (!orderItem) {
      orderItem = new OrderItem({
        userId: userId,
        items: [
          {
            purchaseId: purchase._id,
            productId: productId,
            productName: productName,
            quantity: quantity,
            price: productPrice,
            totalPrice: productPrice * quantity,
          },
        ],
        paymentMode: 'card',
        status: purchase.status,
        deliveredAt : new Date()
      });
      // } 
      console.log(`orderItem not present :       `)
      // else {
      //             // Check if the product already exists in the order item
                  
      //             const itemIndex = orderItem.items.findIndex(item => item.productId.toString() === productId);
      //             console.log(`orderitem Exist :   ${itemIndex}`)
      //             if (itemIndex !== -1) {
      //               // Increase the quantity of the existing product in the order item
      //               orderItem.items[itemIndex].quantity += 1;
      //               orderItem.items[itemIndex].totalPrice += productPrice * quantity;
      //             } else {
      //               // Add a new item to the order item
      //               orderItem.items.push({
      //                 purchaseId: purchase._id,
      //                 productId: productId,
      //                 productName: productName,
      //                 quantity: quantity,
      //                 price: productPrice,
      //                 totalPrice: productPrice * quantity,
      //               });
      //             }
      //           }
            
                // Recalculate the allProductTotalPrice of the order item
                // orderItem.allProductTotalPrice = orderItem.items.reduce((total, item) => total + item.totalPrice, 0);
            
                // Save the order item to the database
                await orderItem.save();

    return res.status(200).json({
      success: true,
      message: 'Purchase created, Payment Successful',
      data: {
        orderItem : orderItem , 
        purchase: purchase,
        customer: customer,
      },
      paymentStatus: purchase.status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `Backend Server Error: ${error}` });
  }
});


router.post('/purchase', async (req, res) => {
  try {
    const { customer_Id, card_Token } = req.body;

    // Retrieve the Stripe customer details
    const customer = await stripe.customers.retrieve(customer_Id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    // 993021
    const userEmail = customer.email;

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

    // Find the existing purchases for the user
    const purchases = await Purchase.find({ userId: userId, status: 'success' });

    // Create a new purchase
    const newPurchase = new Purchase({
      userId,
      productName,
      productId,
      quantity,
      price: productPrice,
      paymentMode: 'card',
      status: 'pending',
    });

    // Save the new purchase to the database
    await newPurchase.save();

    // Update the customer's metadata with the purchaseId
    const updatedMetadata = { ...customer.metadata, purchaseId: newPurchase._id.toString() };
    await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: productPrice * quantity * 100, // Multiply by quantity and 100 to convert to cents
      currency: 'CAD',
      customer: customer_Id,
      payment_method: card.id,
      off_session: true,
      confirm: true,
    });

    // Update the purchase status based on the payment intent status
    newPurchase.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';
    await newPurchase.save();

    // let day = = new Date(times)
    

    // Find or create the order item
    let orderItem = await OrderItem.findOne({ userId: userId });
    
      // Create a new order item if it doesn't exist
    const   neworderItem = new OrderItem({
        userId: userId,
        items: [
          {
            purchaseId: newPurchase._id,
            productId: productId,
            productName: productName,
            quantity: quantity,
            price: productPrice,
            totalPrice: productPrice * quantity,
          },
        ],
        paymentMode: 'card',
        status: newPurchase.status,
        deliveredAt: new Date()
      });


    // Save the order item to the database
    await neworderItem.save();

    return res.status(200).json({
      success: true,
      message: 'Purchase created, Payment Successful',
      data: {
        orderItem: neworderItem,
        purchase: newPurchase,
        customer: customer,
      },
      paymentStatus: newPurchase.status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: `Backend Server Error: ${error}` });
  }
});



//not works 
//now we want multiple ordeitems and purchases 
// router.post('/productPurchase', async (req, res) => {
//   try {
//     const { customer_Id, card_Token } = req.body;

//     // Retrieve the Stripe customer details
//     const customer = await stripe.customers.retrieve(customer_Id);

//     if (!customer) {
//       return res.status(404).json({ success: false, message: 'Customer not found' });
//     }

//     const userEmail = customer.email;
//     console.log(`email : ${customer.email}`);

//     // Find the user in your registered user database based on the email
//     const user = await User.findOne({ email: userEmail });

//     if (!user) {
//       return res.status(401).json({ success: false, message: 'User not logged in' });
//     }

//     const userId = user._id;

//     const { productPrice, quantity,prdouctN productId } = customer.metadata;

//     const productIdsArray = productId.split(',');

//     // Create a new source for the customer
//     const card = await stripe.customers.createSource(customer_Id, {
//       source: card_Token,
//     });

//     // Find the existing purchases for the user
//     const purchases = await Purchase.find({ userId: userId, status: 'success' });

//     let purchaseExists = false;
//     let purchase;

//     for (const existingPurchase of purchases) {
//       if (productIdsArray.includes(existingPurchase.productId.toString())) {
//         existingPurchase.quantity += 1;
//         purchaseExists = true;
//         console.log('Purchase exists:', existingPurchase._id);
//         purchase = existingPurchase;
//         break;
//       }
//     }

//     if (!purchaseExists) {
//       console.log('Purchase does not exist');

//       // Create new purchases for each productId
//       const newPurchases = [];

//       for (const prodId of productIdsArray) {
//         // Find the corresponding product based on the productId
//         const product = await Product.findById(prodId);

//         if (!product) {
//           return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//         // Create a new purchase
//         const newPurchase = new Purchase({
//           userId,
//           productId: prodId,
//           quantity,
//           price: parseFloat(productPrice),
//           paymentMode: 'card',
//           status: 'pending',
//         });

//         // Save the new purchase to the database
//         const savedPurchase = await newPurchase.save();
//         newPurchases.push(savedPurchase);
//       }

//       // Use the first purchase for further processing
//       purchase = newPurchases[0];
//     }

//     // Update the customer's metadata with the purchaseId
//     const updatedMetadata = { ...customer.metadata, purchaseId: purchase._id.toString() };
//     await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

//     // Create a payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: parseFloat(productPrice) * quantity * 100, // Multiply by quantity and 100 to convert to cents
//       currency: 'CAD',
//       customer: customer_Id,
//       payment_method: card.id,
//       off_session: true,
//       confirm: true,
//     });

//     // Update the purchase status based on the payment intent status
//     purchase.status = paymentIntent.status === 'succeeded' ? 'success' : 'failed';

//     // Save the updated purchase to the database
//     await purchase.save();

//     // Find the existing order item for the user
//     let orderItem = await OrderItem.findOne({ userId: userId });

//     if (!orderItem) {
//       // Create a new order item if it doesn't exist
//       orderItem = new OrderItem({
//         userId: userId,
//         items: [],
//         paymentMode: 'card',
//         status: purchase.status,
//       });
//     }

//     // Add or update the items in the order item
//     for (const prodId of productIdsArray) {
//       const existingItem = orderItem.items.find((item) => item.productId.toString() === prodId);

//       if (existingItem) {
//         // Increase the quantity of the existing product in the order item
//         existingItem.quantity += 1;
//         existingItem.totalPrice += parseFloat(productPrice) * quantity;
//       } else {
//         // Find the corresponding product based on the productId
//         const product = await Product.findById(prodId);

//         if (!product) {
//           return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//         // Add a new item to the order item
//         orderItem.items.push({
//           purchaseId: purchase._id,
//           productId: prodId,
//           quantity: quantity,
//           price: parseFloat(productPrice),
//           totalPrice: parseFloat(productPrice) * quantity,
//         });
//       }
//     }

//     // // Recalculate the allProductTotalPrice of the order item
//     // orderItem.allProductTotalPrice = orderItem.items.reduce((total, item) => total + item.totalPrice, 0);

//     // Save the order item to the database
//     await orderItem.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Purchase created, Payment Successful',
//       data: {
//         orderItem: orderItem,
//         purchase: purchase,
//         customer: customer,
//       },
//       paymentStatus: purchase.status,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: `Backend Server Error: ${error}` });
//   }
// });





// // //customerID
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

//       const updatedMetadata = { ...customer.metadata, purchaseId: purchase._id };
//       await stripe.customers.update(customer_Id, { metadata: updatedMetadata });

//       const orderItem = new OrderItem({
//         userId: userId, // Add the userId here if available
//         purchaseId: purchase._id,
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





//purchase order all record 
router.get('/purchase', async (req, res) => {
  try {
    const purchases = await Purchase.find({})
    if (!purchases) {
      return res.status(404).json({ message: 'Purchase not found' }); s
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