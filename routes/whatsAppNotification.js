

require('dotenv').config();
const express = require('express');
const User = require('../model/userModel');
const  Notification = require('../model/notificationModel');
const router = express.Router();
const Category = require('../model/categoryModel');
const Product = require('../model/userProductModel');




const axios = require('axios');

router.post('/send-whatsapp', async function(req, res, next) {
  try {
    // Extract recipient and message from the request body
    const recipient = `+91${req.body.recipient}`; // Add "+91" as the country code for India
    const message = req.body.message;

    // Define the function to get the input for the message
    function getTextMessageInput(recipient, text) {
      return JSON.stringify({
        "messaging_product": "whatsapp",
        "preview_url": false,
        "recipient_type": "individual",
        "to": recipient,
        "type": "text",
        "text": {
          "body": text
        }
      });
    }

    // Define the function to send the message
    async function sendMessage(data) {
      const config = {
        method: 'post',
        url: `https://graph.facebook.com/v17.0/109946778832941/messages`,
        headers: {
          'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: data
      };

      const response = await axios(config);
      return response.data; // Only return the response data instead of the entire response object
    }

    // Create the message payload
    const data = getTextMessageInput(recipient, message);

    // Send the message
    const response = await sendMessage(data);

    // Send a response indicating success
    console.log('Message sent to all registered users');
    res.status(200).json({ success: true, message: 'Message sent to all registered users', data: response });
  } catch (error) {
    console.error(`Error sending message: ${error}`);
    if (error.response && error.response.data && error.response.data.error) {
      const errorMessage = error.response.data.error.message;

      // Handle specific error messages or error codes
      if (errorMessage === '(#100) Invalid parameter') {
        // Handle invalid parameter error
        res.status(400).send('Invalid parameter');
      } else {
        // Handle other errors
        res.status(500).send('Internal Server Error');
      }
    } else {
      // Handle other errors
      res.status(500).send('Internal Server Error');
    }
  }
});

//----------------------------------------------------------------------runing down part =---------------------------------------------------------------------------------------------------------------------


// const axios = require('axios');
// function getTemplatedMessageInput(recipient) {
//   return JSON.stringify({
//     "messaging_product": "whatsapp",
//     "to": recipient,
//     "type": "text",
//     "text": {
//       "body": "Hello, world!"
//     }
//   });
// }


// function sendMessage(data) {
//   const config = {
//     method: 'post',
//     url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
//     headers: {
//       'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
//       'Content-Type': 'application/json'
//     },
//     data: data
//   };

//   return axios(config);
// }

// function getTextMessageInput(recipient, text) {
//   return JSON.stringify({
//     "messaging_product": "whatsapp", // Add the messaging_product parameter
//     "preview_url": false,
//     "recipient_type": "individual",
//     "to": recipient,
//     "type": "text",
//     "text": {
//       "body": text
//     }
//   });
// }




const WhatsappAPI = require('whatsapp-business-api');

// Initialize the WhatsApp Business API client with your credentials
const wp = new WhatsappAPI({
  accountPhoneNumberId: process.env.APP_ID,
  accessToken: process.env.ACCESS_TOKEN,
});

// Define an API endpoint that sends a message to all registered users
router.post('/send', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Retrieve the list of registered users from your database
    const users = await User.find().select('phone');

    // Loop through each user and send the notification
    for (const user of users) {
      const notification = new Notification({
        recipient: user._id,
        message: message,
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
    res.status(200).json({ success: true, message: 'Message sent to all registered users' });
    console.log('Message sent to all registered users');
  } catch (error) {
    console.error(`Error sending message: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// // Define an API endpoint that sends a message to all registered users
router.post('/send', async (req, res) => {
    const { message } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
  
    // Retrieve the list of registered users from your database
    const users = await User.find().select('phone');
  
    // Loop through each user and send the notification
    for (const user of users) {
      const notification = new Notification({
        recipient: user._id,
        message: message,
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
    console.log('Message sent to all registered users!');
  });


  
  function getTemplatedMessageInput(recipient, message) {
    return JSON.stringify({
      "messaging_product": "whatsapp",
      "to": recipient,
      "type": "text",
      "text": message
    });
  }

  // const axios = require('axios');

  function sendMessage(data) {
    const config = {
      method: 'post',
      url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: data
    };
  
    return axios(config);
  }
  
  function getTextMessageInput(recipient, text) {
    return JSON.stringify({
      "messaging_product": "whatsapp",
      "preview_url": false,
      "recipient_type": "individual",
      "to": recipient,
      "type": "text",
      "text": {
        "body": text
      }
    });
  }
  








module.exports = router