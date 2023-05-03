




require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mailgen = require('mailgen');
const Category = require('../model/categoryModel');
const Product = require('../model/productModel');
const HelpArticle = require('../model/helpArticleModel');
const { verifyAdminToken, isAdmin } = require('../middleware/token');


// Receive Email for Query
router.post('/email', async (req, res) => {
  const user_id = req.body.user_id;
  const product_id = req.body.product_id;
  const category_id = req.body.category_id;
  const Name = req.body.Name;
  const Email = req.body.Email;
  const whatsapp = req.body.whatsapp;
  const size = req.body.size;
  const color = req.body.color;
  // const newQuery = req.body.newQuery;
  const stockAvailability = req.body.stockAvailability;
  const status = "OPEN"
  const message = req.body.message;


  // Check if all required fields are provided
  if (!user_id || !product_id || !category_id || !Name || !Email || !whatsapp || !message || !size || !stockAvailability || !status) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  //         // Find the product and category

  // Find the product and category
  const product = await Product.findById(product_id);
  const category = await Category.findById(category_id);


  // Check if product and category exist

  if (!product || !category) {
    return res.status(404).json({ message: `${!product ? 'Product' : 'Category'} not found` });
  }
  const query = new HelpArticle({
    user_id, product_id, category_id, Name, Email, whatsapp, size, stockAvailability,color,message,
    status: 'Open',
  });
  await query.save()
    .then(() => {
      // Send email code here
      res.status(200).json({ success: true, data: query, message: `Sent !!!` });
    })
    .catch((error) => {
      res.status(500).json({ success: false, data: error });
    });


  let config = {
    service: 'gmail',
    auth: {
      user: process.env.USEREMAIL,
      pass: process.env.PASSWORD
    }
  }
  let transporter = nodemailer.createTransport(config);

  let mailGenerator = new mailgen({
    theme: "default",
    product: {
      name: 'My App',
      link: 'https://myapp.com/'
    }

  });

  const emailBody = {
    body: {
      intro: "Email Successfully",
      table: {
        data: [
          {
            //-----change 

            user_id: user_id,
            product_id: product_id,
            category_id: category_id,

            Name: Name,
            Email: Email,
            whatsapp: whatsapp,
            message: message,
            size: size,
            color:color,
            stockAvailability: stockAvailability,
            status: "OPEN"

          }
        ]
      },
      outro: "Looking forward to do more business"
    }
  };
  const emailTemplate = mailGenerator.generate(emailBody);
  const emailText = mailGenerator.generatePlaintext(emailBody);

  //send email
  transporter.sendMail({
    from: req.body.email, // form email (client email)
    to: process.env.USEREMAIL, //qamar sir(company email)
    subject: 'New User Registration',
    text: emailText,
    html: emailTemplate
  },
    (error, info) => {
      if (error) {
        res.status(500).send('Email could not be sent');
      } else {
        res.status(200).send("Email sent Successfully");

      }
    });

});


//Admin query for help center articles
router.get('/email', verifyAdminToken,isAdmin  ,async (req, res) => {

  try {

    const helpArticles = await HelpArticle.find();
    res.status(200).json({ success: true, message: `All Mail` , data: helpArticles })

  } catch (error) {
    res.status(500).json({ success: false, data: error });
  }

});



module.exports = router;