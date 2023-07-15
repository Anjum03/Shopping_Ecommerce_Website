
require('dotenv').config()
const router = require('express').Router();
const Product = require("../model/userProductModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// stripe-customer
// router.post('/stripe-customer', async (req, res) => {
//   try {
//     const { email, productId, quantity } = req.body;

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }

//     const variation = product.variations[0];

//     if (!variation) {
//       return res.status(404).json({ success: false, message: 'Variation not found' });
//     }

//     const price = variation.materials[0].price;

//     const customer = await stripe.customers.create({
//       email: email,
//       metadata: {
//         productId : productId,
//         productName: product.name,
//         productImages: product.thumbs[0],
//         productPrice: price,
//         quantity: quantity
//       }
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Created stripe-customer successfully',
//       data: customer,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
//   }
// });



//WORKING FOR SINGLE PRODUCT
// //existing user or new user 
// router.post('/stripe-customer', async (req, res) => {
//   try {
//     const { email, productId, quantity , } = req.body;

//     const product = await Product.findById(productId);

//         if (!product) {
//           return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//     //     const variation = product.variations[0];

//     // if (!variation) {
//     //   return res.status(404).json({ success: false, message: 'Variation not found' });
//     // }

//     // const price = variation.materials[0].price;

//     let customer = await stripe.customers.list({ email: email, limit: 1 });

//     if (customer.data.length > 0) {
//       // Existing customer found, add product details to their array
//       customer = customer.data[0];
//       const existingMetadata = customer.metadata;

//       const updatedMetadata = {
//         ...existingMetadata,
//         email:email,
//         productId: productId,
//         productName: product.name,
//         productImages: product.thumbs[0],
//         productPrice: product.totalPrice,
//         quantity: quantity
//       };

//       await stripe.customers.update(customer.id, { metadata: updatedMetadata });
//     } else {
//       // Create a new customer and add product details
//       const product = await Product.findById(productId);

//       if (!product) {
//         return res.status(404).json({ success: false, message: 'Product not found' });
//       }

//       customer = await stripe.customers.create({
//         email: email,
//         metadata: {
//           email:email,
//           productId: productId,
//           productName: product.name,
//           productImages: product.thumbs[0],
//           productPrice:product.totalPrice,
//           quantity: quantity
//         }
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Created stripe-customer successfully',
//       data: customer,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
//   }
// });


//working with multiple prdoucts and quantity
router.post('/stripe-customer', async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;
    const productIds = Array.isArray(productId) ? productId : [productId];
    const productQuantities = Array.isArray(quantity) ? quantity : [quantity];

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Products not found' });
    }

    const totalPrices = [];
    const metadata = {
      productId: productIds.join(','),
      quantity: productQuantities.join(','),
      realPrice : '',
      productPrice: '',
      productName :'',
    };
    // const variation = products[0].variations[0]; // Access the variation from the first product

    // if (!variation) {
    //   return res.status(404).json({ success: false, message: 'Variation not found' });
    // }
    
    // const priceRate = variation.materials[0].price;
    for (let i = 0; i < productIds.length; i++) {
      const product = products.find((p) => p._id.toString() === productIds[i]);
      const price = product ? product.totalPrice * productQuantities[i] : NaN;
      totalPrices.push(price);
      metadata.productPrice += price.toString() + ','
      metadata.productName += product ? product.name + ',' : '';
      metadata.realPrice += product ? product.totalPrice + ',' : '';
    }

    // Remove the trailing comma from productPrice
    metadata.productPrice = metadata.productPrice.slice(0, -1);
    metadata.productName = metadata.productName.slice(0, -1);
    metadata.realPrice = metadata.realPrice.slice(0, -1);

    let customer = await stripe.customers.list({ email: email, limit: 1 });

    // Create a new customer and add product details
    const newCustomer = await stripe.customers.create({
      email: email,
      metadata: metadata,
    });

    newCustomer.metadata = metadata; // Include the metadata in the response

    res.status(200).json({
      success: true,
      message: 'Created stripe-customer successfully',
      data: newCustomer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});


// ----------------- as per last meeting----------------
// router.post('/stripe-customer', async (req, res) => {
//   try {
//     const { email, productId, quantity , } = req.body;

//     const product = await Product.findById(productId);

//         if (!product) {
//           return res.status(404).json({ success: false, message: 'Product not found' });
//         }

//     //     const variation = product.variations[0];

//     // if (!variation) {
//     //   return res.status(404).json({ success: false, message: 'Variation not found' });
//     // }

//     // const price = variation.materials[0].price;

//     let customer = await stripe.customers.list({ email: email, limit: 1 });

//     if (customer.data.length > 0) {
//       // Existing customer found, add product details to their array
//       customer = customer.data[0];
//       const existingMetadata = customer.metadata;

//       const updatedMetadata = {
//         ...existingMetadata,
//         email:email,
//         productId: productId,
//         productName: product.name,
//         productImages: product.thumbs[0],
//         productPrice: product.totalPrice,
//         quantity: quantity
//       };

//       await stripe.customers.update(customer.id, { metadata: updatedMetadata });
//     } else {
//       // Create a new customer and add product details
//       const product = await Product.findById(productId);

//       if (!product) {
//         return res.status(404).json({ success: false, message: 'Product not found' });
//       }

//       customer = await stripe.customers.create({
//         email: email,
//         metadata: {
//           email:email,
//           productId: productId,
//           productName: product.name,
//           productImages: product.thumbs[0],
//           productPrice:product.totalPrice,
//           quantity: quantity
//         }
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Created stripe-customer successfully',
//       data: customer,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
//   }
// });





//add-card all digit 
router.post('/add-card', async (req, res) => {
  const { customer_Id, card_Name, card_ExpYear, card_ExpMonth, card_Number, card_CVC } = req.body;

  try {
    const card_Token = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        exp_month: card_ExpMonth,
        exp_year: card_ExpYear,
        cvc: card_CVC,
      },
    });

    // const card = await stripe.customers.createSource(customer_Id, {
    //   source: card_Token.id,
    // });

    res.status(200).json({
      success: true,
      message: 'Created add-card successfully',
      data:{ 
         source :  card_Token.id    , 
        //  card: card.id
         }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});


// //add-card for last 4 digit
// router.post('/add-cards', async (req, res) => {
//   const { customer_Id, card_Name, card_ExpYear, card_ExpMonth, lastFourDigits, card_CVC } = req.body;

//   try {
//     const card_Token = await stripe.tokens.create({
//       card: {
//         name: card_Name,
//         exp_month: card_ExpMonth,
//         exp_year: card_ExpYear,

//         last4: lastFourDigits, // Use the lastFourDigits provided from the frontend
//         cvc: card_CVC,
//       },
//     });

//     const card = await stripe.customers.createSource(customer_Id, {
//       source: card_Token.id,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Created add-card successfully',
//       data: {
//         source: card_Token.id,
//         card: { id: card.id, lastFourDigits: lastFourDigits },
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
//   }
// });




// create-charge
router.post('/create-charge', async (req, res) => {
  try {
    const customer = await stripe.customers.retrieve(req.body.customer_Id);
    const cardId = customer.default_source;

    const createCharge = await stripe.charges.create({
      customer: req.body.customer_Id,
      receipt_email: req.body.email,
      amount: 9000,
      currency: 'CAD', // Update currency to CAD for Canadian dollars
      source: cardId,
    });

    res.status(200).json({
      success: true,
      message: 'Created create-charge successfully',
      data: createCharge,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false,error: 'Backend Server error :' + error });
  }
});
    


router.post('/payments', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sample Product",
            },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/shop`, //redirection page after payment success
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: "Error creating checkout session" });
  }
});











// router.post('/stripe-customer', async (req, res) => {
//   try {
//     const { email, productId, quantity } = req.body;

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }

//     const variation = product.variations[0];

//     if (!variation) {
//       return res.status(404).json({ success: false, message: 'Variation not found' });
//     }

//     const price = variation.materials[0].price;

//     const customer = await stripe.customers.create({
//       email: email,
//       metadata: {
//         productId : productId,
//         productName: product.name,
//         productImages: product.thumbs[0],
//         productPrice: price,
//         quantity: quantity
//       }
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Created stripe-customer successfully',
//       data: customer,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
//   }
// });






/////////////////////////////////////////one in all\ //////////////dev part 
// router.post('/Stripe', async (req, res) => {
 
//   const { card_Name, card_ExpYear, card_ExpMonth, card_Number, card_CVC , email } = req.body;

//   try {
//     // Create a new customer in Stripe
//     const customer = await stripe.customers.create({
//       email: email
//     });

//     // Create a card token using the provided card details
//     const card_Token = await stripe.tokens.create({
//       card: {
//         name: card_Name,
//         number: card_Number,
//         exp_month: card_ExpMonth,
//         exp_year: card_ExpYear,
//         cvc: card_CVC,
//       },
//     });

//     // Add the card to the customer
//     const addedCard = await stripe.customers.createSource(customer.id, {
//       source: card_Token.id,
//     });

//     // Retrieve the customer details after adding the card
//     const retrievedCustomer = await stripe.customers.retrieve(customer.id);

//     // Create a charge using the newly added card
//     const createCharge = await stripe.charges.create({
//       customer: retrievedCustomer.id,
//       receipt_email: retrievedCustomer.email,
//       amount: 9000,
//       currency: 'CAD',
//       // currency: 'INR',
//       source: addedCard.id,
//     });


//     const payment = {
//       productName: productName,
//       // productImg: productImg,
//       productPrice: productPrice,
//       quantity: quantity,
//       status: createCharge.status,
//       // Add any other relevant payment details you want to save
//     };



//     res.status(200).json({
//       success: true,
//       message: 'Created add-card and charge successfully',
//       data: {
//         card: addedCard.id,
//         customer: retrievedCustomer,
//         createCharge: createCharge,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
//   }
// });



















module.exports = router;
 