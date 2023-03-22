

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
const Category = require('../model/productModel');
const HelpArticle = require('../model/helpArticleModel');


    // Send email to user with product details
    let config = {
        service: 'gmail',
        auth: {
            user: process.env.USERSEMAIL,
            pass: process.env.USERPASSWORD
        }
    }
    const transporter = nodemailer.createTransport(config);


// Receive Email for Query
router.get('/category/:id', async (req, res) => {

    try {
 
        // Check if product exists
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(500).json({ success: false, data: `Category Not Found` });
        }

        const {firstName, lastName ,email} = req.body;

        // // Send email to user with product details
        // let config = {
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.USERSEMAIL,
        //         pass: process.env.USERPASSWORD
        //     }
        // }
        // const transporter = nodemailer.createTransport(config);

        let mailGenerator = new mailgen({
            theme: "default",
            category: {
                name: 'MaryamRaj ',
                link: 'https://maryamRaj.com/'
            }

        });

        const emailBody = {
            body: {
                name: req.body.firstName, intro: "Email Successfully",
                intro:`Your Query has been arrived!`,
                table: {
                    data: [
                        {
                            firstName: firstName,
                            lastName: lastName,
                            email: email,
                        }
                    ]
                },
                outro: "Looking forward to do more business"
            }
        };

        const emailTemplate = mailGenerator.generate( emailBody);
        const emailText = mailGenerator.generatePlaintext(emailBody);

        const msg = {
            from: req.body.email,           //complaint person
            to: process.env.USERNAME,       //company emai;
            subject: `Product Details - ${category.name}`,
            text: emailText,
            html: emailTemplate
        };

        transporter.sendMail(msg, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, data: error, message:`Email not sent SuccessFully ...` });
            } else {
                return res.status(200).json({ data: info.response, success: true, message: `Email Sent..` })
            }
        })

        res.status(200).json({ success: true, data: category, message:`Sent !!!` });

    } catch (error) {
        res.status(500).json({ success: false, data: error })
    }

})



//Admin query for help center articles
router.get('/helpCenter', verifyToken, isAdmin, async (req, res) => {

    try {

        const helpArticles = await HelpArticle.find();
        res.status(200).json({ success: true, data: helpArticles })

    } catch (error) {
        res.status(500).json({ success: false, data: error });
    }

});



module.exports = router;