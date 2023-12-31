
require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mailgen = require('mailgen');
const Category = require('../model/categoryModel');
const UserProduct = require('../model/userProductModel');
const User = require('../model/userModel');
const HelpArticle = require('../model/helpArticleModel');
const { verifyAdminToken, isAdmin } = require('../middleware/token');


// Receive Email for Query
router.post('/email', async (req, res) => {
  const { Name, Email, whatsapp, size, color, quantity, message, productName } = req.body;

  const query = new HelpArticle({
    productName,
    Name,
    Email,
    whatsapp,
    size,
    quantity,
    color,
    message,
    status: 'Open',
  });

  try {
    const savedQuery = await query.save();

    // const product = await UserProduct.findById(productId).select('name');

    // if (!product) {
    //   return res.status(404).json({ message: 'Product not found' });
    // }

    const responseData = {
      productName: savedQuery.productName,
      Name: savedQuery.Name,
      Email: savedQuery.Email,
      whatsapp: savedQuery.whatsapp,
      size: savedQuery.size,
      color: savedQuery.color,
      message: savedQuery.message,
      quantity: savedQuery.quantity,
      status: savedQuery.status,
      _id: savedQuery._id,
    };

    res.status(200).json({
      success: true,
      data: responseData,
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
        name: 'MairamRaj',
        link: 'https://mariamraj.com/',
      },
    });

    const emailBody = {
      body: {
        intro: 'Email Successfully',
        table: {
          data: [
            {
              user_name: Name,
              user_email: Email,
              user_whatsapp: whatsapp,
              productName: productName,
              message: message,
              size: size,
              color: color,
              quantity: quantity,
              status: 'OPEN',
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
        subject: 'New User Registration',
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



// Express route to handle admin replies
//id = queryId
router.post('/email/:id/reply', async (req, res) => {

  const { adminEmail, adminReply } = req.body;

  const queryId = req.params.id;

    // Update the document with admin email and reply
  const query = await HelpArticle.findByIdAndUpdate(
    queryId, { adminEmail, adminReply, status: 'Closed' },
    { new: true }
  );

  // const { Name, adminEmail: responseAdminEmail, adminReply: responseAdminReply } = query;

  //save the reply in db
  await query.save().then(() => {
      // Send email code here
      res.status(200).json({
        success: true, data: {
       adminReply:adminReply
        }, message: `Reply to User from Admin !!!`
      });
    })
    .catch((error) => {
      res.status(500).json({ success: false, data: error });
    });

   // Send email to user
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
    name: 'MariamRaj',
    link: 'https://mariamraj.com/'
  }

});

const emailBody = {
  body: {
    intro: "I have recevied your Eamil",
    table: {
      data: [
        {
          //-----change 
          adminReply: adminReply,

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
  from: process.env.USEREMAIL, //qamar sir(company email)
  to: query.Email, // to user email (client email)
  subject: 'Reply Admin',
  text: emailText,
  html: emailTemplate
},
  (error, info) => {
    if (error) {
      res.status(500).send('Email could not be sent');
    } else {
      console.log(`Email sent to ${query.Email}: ${info.response}`);
      res.status(200).send(`Email sent to ${query.Email}: ${info.response}`);

    }
  });
})



//Admin get all query for help center articles
router.get('/email', verifyAdminToken, isAdmin, async (req, res) => {

  try {

    const helpArticles = await HelpArticle.find();
    res.status(200).json({ success: true, message: `All Mail`, data: helpArticles })

  } catch (error) {
    res.status(500).json({ success: false, data: error });
  }

});



///Admin gget by id query for help center articles
router.get('/email/:id', verifyAdminToken, isAdmin, async (req, res) => {
  try {
    const helpArticle = await HelpArticle.findById(req.params.id)
    if (!helpArticle) {
      return res.status(404).send();
    }

    if (!helpArticle) {
      return res.status(404).json({ message: 'helpArticle not found' });
    }

    res.status(200).json({
      success: true,
      message: 'helpArticle and associated product and category retrieved successfully',
      data: helpArticle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});



// //Admin can get by userId also
// router.get('/email/:userId', verifyAdminToken, isAdmin, async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await User.findById(userId).select('firstName');

//     const helpArticle = await HelpArticle.find({ user_id: userId }).populate('product_id', 'name').populate('category_id', 'name');
//     res.status(200).json({
//       success: true, message: `User's First Name`,
//       data: { User: user.firstName, helpArticle }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, data: error });
//   }
// });



//delete helpArticle  record
router.delete('/email/:id', verifyAdminToken, isAdmin, async (req, res) => {
  try {
    const helpId = req.params.id
    const helpArticle = await HelpArticle.findByIdAndDelete(helpId);
    if (!helpArticle) {
      return res.status(404).json({ success: false, data: `No Email Found` });
    }
    return res.status(200).json({ success: true, message: 'The order is deleted!', data: helpArticle });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;