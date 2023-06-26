
require('dotenv').config()
const router = require('express').Router();
const Product = require("../model/userProductModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




//existing user or new user 
router.post('/stripe-customer', async (req, res) => {
  try {
    const { email, productId, quantity , } = req.body;

    const product = await Product.findById(productId);

        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }


    let customer = await stripe.customers.list({ email: email, limit: 1 });

    if (customer.data.length > 0) {
      // Existing customer found, add product details to their array
      customer = customer.data[0];
      const existingMetadata = customer.metadata;

      const updatedMetadata = {
        ...existingMetadata,
        email:email,
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


      customer = await stripe.customers.create({
        email: email,
        metadata: {
          email:email,
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
        customer_Id : customer_Id,
         source :  card_Token.id    , 
        //  card: card.id
         }
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







module.exports = router;
 