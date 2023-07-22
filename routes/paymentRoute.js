
require('dotenv').config()
const router = require('express').Router();
const Product = require("../model/userProductModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


//working with multiple prdoucts and quantity
router.post('/stripe-customer', async (req, res) => {
  try {
    const { email, productId, quantity, currencyType } = req.body;
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
      realPrice: '',
      productPrice: '',
      productName: '',
      currencyType: currencyType,
    };
   
    for (let i = 0; i < productIds.length; i++) {
      const product = products.find((p) => p._id.toString() === productIds[i]);
      const quantity = productQuantities[i];
      let price;
      let realPrice; // Variable to store the real price in USD or Pound

      switch (currencyType) {
        case 'usd':
          price = product ? product.usdTotalPrice * quantity : NaN;
          realPrice = product ? product.usdTotalPrice : NaN;
          break;
        case 'gbp':
          price = product ? product.poundTotalPrice * quantity : NaN;
          realPrice = product ? product.poundTotalPrice : NaN;
          break;
        default:
          price = product ? product.totalPrice * quantity : NaN;
          realPrice = product ? product.totalPrice : NaN;
          break;
      }

      totalPrices.push(price);
      metadata.productPrice += price.toString() + ',';
      metadata.productName += product ? product.name + ',' : '';
      metadata.realPrice += realPrice ? realPrice + ',' : ''; // Include realPrice based on the selected currency type

    }

    // Remove the trailing comma from productPrice and realPrice
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

    res.status(200).json({
      success: true,
      message: 'Created add-card successfully',
      data: {
        source: card_Token.id,
        //  card: card.id
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Backend Server error: ' + error });
  }
});




module.exports = router;
