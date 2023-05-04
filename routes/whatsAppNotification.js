

require('dotenv').config();
const express = require('express');
const User = require('../model/userModel');
const  Notification = require('../model/notificationModel');
const router = express.Router();
const { verifyAdminToken, isAdmin, } = require('../middleware/token');

const WhatsappAPI = require('whatsapp-business-api');

// Initialize the Express app and the WhatsApp Business API client
const wp = new WhatsappAPI({
    accountPhoneNumberId: '109394125482979',
    accessToken: 'EAAN6zzI7ig8BAMCrUBKFnFlj6n8KQ25BBKXUNB4l2aLZA94EvgTGgnx0aY7XC1201W2OeozRDVrMJRviZB5rCSLynkqNSGZBcttjGFCqqG3gZCJIoKGNDDrZBjqNPaPrKhsZAqLXV53FPHZAxFlISQVnmev3Ri1yOhD0PBpFGuiL5tq66UqGmyx2DixHgQq9UNpbZCA5ZBVALyGEwyy0Luh0eOnbqHpG7n2bCjA1xZBLyvHwZDZD'
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




module.exports = router