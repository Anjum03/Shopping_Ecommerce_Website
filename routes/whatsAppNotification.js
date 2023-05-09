

require('dotenv').config();
const express = require('express');
const User = require('../model/userModel');
const  Notification = require('../model/notificationModel');
const router = express.Router();
const { verifyAdminToken, isAdmin, } = require('../middleware/token');

// const WhatsappAPI = require('whatsapp-business-api');
// const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');

// const wp = new WhatsappCloudAPI({
//     accessToken:'EAAN6zzI7ig8BAPZAx6FakraHoJWcYv3OK3p50qAbT4Upg6b5fXFk8IZB0brrPsxlYXaK8ZBqqsQiaU1YozvKMYJOUBOnmZCmgFZCbZByj2c9UmfVSW9mvhfzQA3s9wYiix6V2LiGtCRrB2QiqkH1UeIbZCy9wZC1OIyuiW1s9SxBjAgOhgv85q4H3A81CDrBVnvuMiwWRNcPDdIEkUkhnAKgnjDiXCBABz4ZD'
//     ,//'Your access token here',
//     senderPhoneNumberId:   109394125482979   ,// 'Your sender phone number id here',
//     WABA_ID:  118326417915153  //'Your Whatsapp Business Account id here',
// });

// Initialize the Express app and the WhatsApp Business API client
// const wp = new WhatsappAPI({
//     accountPhoneNumberId: '109394125482979',
//     accessToken: 'EAAN6zzI7ig8BAMCrUBKFnFlj6n8KQ25BBKXUNB4l2aLZA94EvgTGgnx0aY7XC1201W2OeozRDVrMJRviZB5rCSLynkqNSGZBcttjGFCqqG3gZCJIoKGNDDrZBjqNPaPrKhsZAqLXV53FPHZAxFlISQVnmev3Ri1yOhD0PBpFGuiL5tq66UqGmyx2DixHgQq9UNpbZCA5ZBVALyGEwyy0Luh0eOnbqHpG7n2bCjA1xZBLyvHwZDZD'
// });




const WhatsappAPI = require('whatsapp-business-api');

// Initialize the WhatsApp Business API client with your credentials
const wp = new WhatsappAPI({
    accountPhoneNumberId: 'your_phone_number_id',
    accessToken: 'your_access_token',
});

// Define an API endpoint that sends a message to all registered users
router.post('/send', async (req, res) => {
    const {message} = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Retrieve the list of registered users from your database
    const users = await User.find().select('phone');

    // Loop through each user and send the notification
    for (const user of users) {
        const notification = new Notification({
            recipient: user._id,
            message: message
        });
        try {
            await wp.sendTextMessage(user.phone, { body: message });
            notification.statusUpdate = 'Delivered';
        } catch (error) {
            console.error(`Failed to send notification to ${user.phone}: ${error}`);
            notification.statusUpdate = 'Failed';
        }

        await notification.save();
    }

    // Send a response indicating success
    res.send('Message sent to all registered users!');
    console.log(`Message sent to all registered users!`)
});


// Define an API endpoint that sends a message to all registered users
// router.post('/https://graph.facebook.com/v16.0/107867018969527/messages', async (req, res) => {
//     const { messaging_product, recipient_type, to, type, text  } =  req.body ;
//     const messageBody = text.body ;

//     if (!messageBody) {
//         return res.status(400).json({ error: 'Message is required' });
//     }

//     const recipient = { phone_number: to };
//     const message = { text: messageBody };

//     // Retrieve the list of registered users from your database
//     const users = await User.find().select('phone');

//     // Loop through each user and send the notification
//     for (const user of users) {
//         const notification = new Notification({
//             recipient: user._id,
//             message: message
//         });
//         try {
//             await wp.sendMessage(messaging_product, recipient_type, recipient, message);
//             notification.statusUpdate = 'Delivered';
//             await notification.save();
//         } catch (error) {
//             console.error(`Failed to send notification to ${user.phone}: ${error}`);
//             notification.statusUpdate = 'Failed';
//         }
//     }

//     // Send a response indicating success
//     res.send('Message sent to all registered users!');
//     console.log(`Message sent to all registered users!`);
// });



module.exports = router