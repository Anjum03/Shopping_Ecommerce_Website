require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mailgen = require('mailgen');
const AboutUsEmail = require('../model/aboutUsEmailModel');
const User = require('../model/userModel');
const Category = require('../model/categoryModel');
const Product = require('../model/userProductModel');


// Receive Email for Query
router.post('/aboutUsEmail', async (req, res) => {
  const {name ,  Email, message, subject } = req.body;

  try {
    const aboutUsEmail = new AboutUsEmail({
      name : name ,
      Email : Email,
      subject : subject,
      message : message,
    });
    const result = await aboutUsEmail.save();

    res.status(200).json({
      success: true,
      data: result, // Pass the query object directly to the response
      message: 'Sent!!!',
    });

    let config = {
      service: 'gmail',
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(config);

    let mailGenerator = new mailgen({
      theme: 'default',
      product: {
        name: 'My App',
        link: 'https://myapp.com/',
      },
    });

    const emailBody = {
      body: {
        intro: 'Email Successfully',
        table: {
          data: [
            {
              name : name ,
              user_email: Email,
              message: message,
              subject : subject ,
            },
          ],
        },
        outro: 'Looking forward to doing more business',
      },
    };
    const emailTemplate = mailGenerator.generate(emailBody);
    const emailText = mailGenerator.generatePlaintext(emailBody);

    transporter.sendMail(
      {
        from: req.body.email, // form email (client email)
        to: process.env.USEREMAIL, //qamar sir(company email)
        subject: 'Email from User ',
        text: emailText,
        html: emailTemplate,
      },
      (error, info) => {
        if (error) {
          console.log('Error:', error);
          res.status(500).send('Email could not be sent');
        } else {
          console.log('Email sent:', info.response);
        }
      }
    );
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ success: false, data: error });
  }
});



//send mail to registerd User for publish category/product from admin
router.post('/publish', async (req, res) => {
  // const { Email, message, subject } = req.body;

  try {
    

     const product  = await Product.findOne({publish : true});
     const category = await Category.findOne({ publish : true});

     if(product || category){
      const users = await User.find();

      //send mail Part 

    let config = {
      service: 'gmail',
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSWORD,
      },
    };

    let transporter = nodemailer.createTransport(config);

    let mailGenerator = new mailgen({
      theme: 'default',
      product: {
        name: 'MariamRaj Clothing Website ',
        link: `https://mariamraj.com/`,
      },
    });

    const emailBody = {
      body: {
        intro: 'Email Successfully',
        table: {
          data: [
            {
              websiteLink : `https://mariamraj.com/`
              
            },
          ],
        },
        outro: 'Looking forward to doing more business',
      },
    };

    const emailTemplate = mailGenerator.generate(emailBody);
    const emailText = mailGenerator.generatePlaintext(emailBody);

    users.forEach((user)=>{
      transporter.sendMail(
        {
          to : user.email,       // form email (client email)
          from : process.env.USEREMAIL, //qamar sir(company email)
          subject: 'Email from User ',
          text: emailText,
          html: emailTemplate,
        },
        (error, info) => {
          if (error) {
            console.log('Error:', error);
            res.status(500).send('Email could not be sent');
          } else {
            console.log('Email sent:', info.response);
          }
        }
      );
    })

    res.status(200).json({
      success: true,
      data: result, // Pass the query object directly to the response
      message: 'Sent!!!',
    });

     } else {
      res.status(200).json({
        success: true,
        message: 'Category or product is not published',
      });
     }
  
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ success: false, data: error });
  }
});


module.exports = router;