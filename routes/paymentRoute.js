
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



//existing user or new user 
router.post('/stripe-customer', async (req, res) => {
  try {
    const { email, productId, quantity ,} = req.body;

    const product = await Product.findById(productId);

        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }

    //     const variation = product.variations[0];

    // if (!variation) {
    //   return res.status(404).json({ success: false, message: 'Variation not found' });
    // }

    // const price = variation.materials[0].price;

    let customer = await stripe.customers.list({ email: email, limit: 1 });

    if (customer.data.length > 0) {
      // Existing customer found, add product details to their array
      customer = customer.data[0];
      const existingMetadata = customer.metadata;

      const updatedMetadata = {
        ...existingMetadata,
        productId: productId,
        productName: product.name,
        productImages: product.thumbs[0],
        productPrice: product.totalPrice,
        quantity: quantity
      };

      await stripe.customers.update(customer.id, { metadata: updatedMetadata });
    } else {
      // Create a new customer and add product details
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const variation = product.variations[0];

      if (!variation) {
        return res.status(404).json({ success: false, message: 'Variation not found' });
      }

      const price = variation.materials[0].price;

      customer = await stripe.customers.create({
        email: email,
        metadata: {
          productId: productId,
          productName: product.name,
          productImages: product.thumbs[0],
          productPrice:product.totalPrice,
          quantity: quantity
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Created stripe-customer successfully',
      data: customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});




//add-card
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

    const card = await stripe.customers.createSource(customer_Id, {
      source: card_Token.id,
    });

    res.status(200).json({
      success: true,
      message: 'Created add-card successfully',
      data: { card: card.id },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});

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





// router.post('/paymentIntents', async (req, res) => {

//   try {
//     const { amount, currency,  } = req.body;
    
//     // Create a payment intent or charge using the Stripe API
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//       payment_method_types: ['card'],
//       // Other Stripe options
//     });
    

//     // Save payment details to the database
//     // const payment = new Payment({
//     //   amount,
//     //   currency,
//     //   // Other payment details
//     // });
//     // await payment.save();

//     res.status(200).json({ paymentIntent : paymentIntent});
//     // res.status(200).json({ payment });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
// ('sk_test_4eC39HqLyjWDarjtT1zdp7dc'); // Api key of secret key 

    


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











router.post('/stripe-customer', async (req, res) => {
  try {
    const { email, productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const variation = product.variations[0];

    if (!variation) {
      return res.status(404).json({ success: false, message: 'Variation not found' });
    }

    const price = variation.materials[0].price;

    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        productId : productId,
        productName: product.name,
        productImages: product.thumbs[0],
        productPrice: price,
        quantity: quantity
      }
    });

    res.status(200).json({
      success: true,
      message: 'Created stripe-customer successfully',
      data: customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});






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
 