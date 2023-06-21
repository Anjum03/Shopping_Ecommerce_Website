require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mailgen = require('mailgen');
const AboutUsEmail = require('../model/aboutUsEmailModel');


// Receive Email for Query
router.post('/aboutUsEmail', async (req, res) => {
  const { Email, message, subject } = req.body;

  try {
    const aboutUsEmail = new AboutUsEmail({
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

module.exports = router;