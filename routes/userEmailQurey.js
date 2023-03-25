




//User can query product other details and should receive an email or in admin query help center 
// step:1 --> get by Id code same copy paste (to search the category)
// step:2 --> post method for sending email 
//step:3  --> In the product route, after retrieving the product details, you can send an email to the user with the product details:
//3.1 ---> get by Id code, send email of message part and send and receive part
//step:4  --> in admin route you need to create a admin-help-center route
//4.1 ---> get method and req.query also and create 1 varible then if and else statement for in if(query){ 1 Variable await and find the text }
// else{ only find property use}
//4.2 send eamil all logic like user and password then to from part then err and reult part


require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mailgen = require('mailgen');
const { verifyToken, isAdmin } = require('../middleware/token');
const Category = require('../model/categoryModel');
const Product = require('../model/productModel');
const HelpArticle = require('../model/helpArticleModel');


// Receive Email for Query
router.post('/email', async (req, res) => {
    console.log(req.body);
const     user_id =   req.body.user_id   ;
const    product_id = req.body.product_id  ;
const    category_id= req.body.category_id ;
//---------change
    const Name = req.body.Name;
    const Email = req.body.Email;
    const whatsapp = req.body.whatsapp;
    const size = req.body.size;
    const stockAvailability = req.body.stockAvailability;
    const status = "OPEN"
    const message = req.body.message ;
    //--------------------------------------------------
 
            // Check if all required fields are provided
            if (!user_id || !product_id || !category_id || !Name || !Email || !whatsapp || !size || !stockAvailability ||!status) {
                console.log()
                return res.status(400).json({ message: 'Please provide all required fields' });
            }
            
    //         // Find the product and category
    
    // Find the product and category
    const product = await Product.findById(product_id);
    const category = await Category.findById(category_id);
    
    // Check if product and category exist
    // Check if product and category exist

    if (!product || !category) {
        return res.status(404).json({ message: `${!product ? 'Product' : 'Category'} not found` });
    }
    const query = new HelpArticle({
        user_id, product_id, category_id, Name, Email, whatsapp,size, stockAvailability,
        status: 'Open',
    });
    await query.save()
    .then(() => {
        // Send email code here
        res.status(200).json({ success: true, data: query, message: `Sent !!!` });
    })
    .catch((error) => {
        console.log(error);
        res.status(500).json({ success: false, data: error });
    });

  //---------------------------------------------------
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
        table:{
          data:[
            {
                //-----change 

                user_id: user_id,
                product_id: product_id,
                category_id: category_id,

             Name:Name,
               Email: Email,
              whatsapp: whatsapp,
              message:message,
              size:size,
              stockAvailability: stockAvailability,
              status:"OPEN"
            
            }
          ]
        },
        outro: "Looking forward to do more business"
      }
    };
    const emailTemplate = mailGenerator.generate( emailBody);
    const emailText = mailGenerator.generatePlaintext(emailBody);
  
    //send email
    transporter.sendMail({
      from: req.body.email, // form email (client email)
      to: process.env.USEREMAIL , //qamar sir(company email)
      subject: 'New User Registration',
      text: emailText,
      html: emailTemplate
    }, 
    (error, info) => {
      if (error) {
        res.status(500).send('Email could not be sent');
        console.log(error);
      } else {
        res.status(200).send("Email sent Successfully");
        console.log('Email sent: ' + info.response);
        
      }
    });
  
});


//Admin query for help center articles
router.get('/helpCenter', verifyToken, isAdmin, async (req, res) => {

    try {

        const helpArticles = await HelpArticle.find();
        res.status(200).json({ success: true, data: helpArticles })

    } catch (error) {
        res.status(500).json({ success: false, data: error });
    }

});


//Queries data save
router.post('/queries', async (req, res) => {
    try {

        const query = new HelpArticle({
            name: req.body.name,
            email: req.body.email,
            whatsapp: req.body.whatsapp,
            size: req.body.size,
            stockAvailability: req.body.stockAvailability,
            status: 'Open',
        });
        await query.save();
        console.log(query);
        res.status(201).json({ success: true, message: 'Query record created successfully', data: query });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

})

//get
router.get('/queries', async (req, res) => {

    try {

        const queries = await HelpArticle.find();
        console.log(queries);
        res.status(200).json({ success: true, data: queries });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

module.exports = router;