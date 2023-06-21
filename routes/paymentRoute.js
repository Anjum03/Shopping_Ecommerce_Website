
require('dotenv').config()
const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// stripe-customer
router.post('/stripe-customer', async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      firstName: req.body.firstName,
      email: req.body.email,
    });
    res.status(200).json({
      success: true,
      message: 'Created stripe-customer successfully',
      data: customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false,error: 'Backend Server error :' + error });
  }
});

// add-card
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
    res.status(500).json({ success: false, error: 'Backend Server error :' + error });
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
      amount: parseInt(req.body.totalPrice) * 100,
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


// router.post('/create-charge', async (req, res) => {
//   try {
//     const createCharge = await stripe.charges.create({
//       receipt_email: req.body.email,
//       amount: parseInt(req.body.totalPrice) * 100,
//       currency: 'CD',
//       source: req.body.customer_Id,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Created create-charge successfully',
//       data: createCharge,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }
// });



router.post('/payments', async (req, res) => {
  try {
    const { amount, currency,  } = req.body;
    
    // Create a payment intent or charge using the Stripe API
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      // Other Stripe options
    });
    

    // Save payment details to the database
    // const payment = new Payment({
    //   amount,
    //   currency,
    //   // Other payment details
    // });
    // await payment.save();

    res.status(200).json({ paymentIntent : paymentIntent});
    // res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
// const stripe = require('stripe')('sk_test_tR3PYbcVNZZ796tH88S4VQ2u');

// const paymentIntent = await stripe.paymentIntents.create({
//   amount: 1099,
//   currency: 'usd',
//   payment_method_types: ['card'],
// });

//get by paymentId
// router.get('/payments/:paymentId', async (req, res) => {
//   try {
//     const paymentId = req.params.paymentId;
    
//     // Retrieve payment details from the database
//     const payment = await Payment.findById(paymentId);

//     res.status(200).json({ payment });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



module.exports = router;
