

require('dotenv').config();
const express = require('express');
const User = require('../model/userModel');
const  Notification = require('../model/notificationModel');
const router = express.Router();
const { verifyAdminToken, isAdmin, } = require('../middleware/token');
const Category = require('../model/categoryModel');
const Product = require('../model/userProductModel');


// const axios = require('axios');
// // const User = require('./models/user');

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
//     "messaging_product": "whatsapp",
//     "preview_url": false,
//     "recipient_type": "individual",
//     "to": recipient,
//     "type": "text",
//     "text": {
//       "body": text
//     }
//   });
// }

// router.post('/naina', async function(req, res, next) {
//   try {
//     // Retrieve all users from the database
//     const users = await User.find().select('phone');
  
//     // Iterate over each user
//     for (const user of users) {
//       // Get the user's phone number and send a message
//       const phoneNumber = user.phone;
//       const data = getTextMessageInput(phoneNumber, 'Welcome to the Movie Ticket Demo App for Node.js!');
      
//       try {
//         await sendMessage(data);
//         console.log(`Message sent to ${phoneNumber}`);
//       } catch (error) {
//         console.log(`Failed to send message to ${phoneNumber}`);
//         console.error(error);
//       }
//     }

//     res.sendStatus(200);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });


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




// 
// module.exports = router;


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


// router.post('/naina', function(req, res, next) {
//   const data = getTextMessageInput(process.env.RECIPIENT_WAID, 'Welcome to the Movie Ticket Demo App for Node.js!');
  
//   sendMessage(data)
//     .then(function (response) {
//       res.sendStatus(200);
//       return;
//     })
//     .catch(function (error) {
//       console.log(error);
//       console.log(error.response.data);
//       if (error.response && error.response.data && error.response.data.error) {
//         const errorMessage = error.response.data.error.message;
//         // Handle specific error messages or error codes
//         if (errorMessage === '(#100) Invalid parameter') {
//           // Handle invalid parameter error
//           res.status(400).send('Invalid parameter');
//         } else {
//           // Handle other errors
//           res.status(500).send('Internal Server Error');
//         }
//       } else {
//         // Handle other errors
//         res.status(500).send('Internal Server Error');
//       }
//       return;
//     });
// });



// --------------------------- running ------------------------



















// const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);


// client.messages
//   .create({
//      mediaUrl: ['https://images.unsplash.com/photo-1545093149-618ce3bcf49d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80'],
//      from: 'whatsapp:+14155238886',
//      to: 'whatsapp:+919156942812'
//    })
//   .then(message => console.log(message.sid));




// const WhatsappAPI = require('whatsapp-business-api');
// const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');

// const wp = new WhatsappCloudAPI({
//     accessToken:'EAAN6zzI7ig8BAPZAx6FakraHoJWcYv3OK3p50qAbT4Upg6b5fXFk8IZB0brrPsxlYXaK8ZBqqsQiaU1YozvKMYJOUBOnmZCmgFZCbZByj2c9UmfVSW9mvhfzQA3s9wYiix6V2LiGtCRrB2QiqkH1UeIbZCy9wZC1OIyuiW1s9SxBjAgOhgv85q4H3A81CDrBVnvuMiwWRNcPDdIEkUkhnAKgnjDiXCBABz4ZD'
//     ,//'Your access token here',
//     senderPhoneNumberId:   109394125482979   ,// 'Your sender phone number id here',
//     WABA_ID:  118326417915153  //'Your Whatsapp Business Account id here',
// });

// // Initialize the Express app and the WhatsApp Business API client
// const wps = new WhatsappAPI({
//     accountPhoneNumberId: '109394125482979',
//     accessToken: 'EAAN6zzI7ig8BAMCrUBKFnFlj6n8KQ25BBKXUNB4l2aLZA94EvgTGgnx0aY7XC1201W2OeozRDVrMJRviZB5rCSLynkqNSGZBcttjGFCqqG3gZCJIoKGNDDrZBjqNPaPrKhsZAqLXV53FPHZAxFlISQVnmev3Ri1yOhD0PBpFGuiL5tq66UqGmyx2DixHgQq9UNpbZCA5ZBVALyGEwyy0Luh0eOnbqHpG7n2bCjA1xZBLyvHwZDZD'
// });

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



// const WhatsappAPI = require('whatsapp-business-api');

// // Initialize the WhatsApp Business API client with your credentials
// const wp = new WhatsappAPI({
//     accountPhoneNumberId: process.env.APP_ID,
//     accessToken:process.env.ACCESS_TOKEN,
// });

// // Define an API endpoint that sends a message to all registered users
// // Define an API endpoint that sends a message to all registered users
// router.post('/send', async (req, res) => {
//     const { message } = req.body;
  
//     if (!message) {
//       return res.status(400).json({ error: 'Message is required' });
//     }
  
//     // Retrieve the list of registered users from your database
//     const users = await User.find().select('phone');
  
//     // Loop through each user and send the notification
//     for (const user of users) {
//       const notification = new Notification({
//         recipient: user._id,
//         message: message,
//       });
//       try {
//         await wp.sendTextMessage(user.phone, { body: message });
//         notification.statusUpdate = 'Delivered';
//       } catch (error) {
//         console.error(`Failed to send notification to ${user.phone}: ${error}`);
//         notification.statusUpdate = 'Failed';
//       }
  
//       await notification.save();
//     }
  
//     // Send a response indicating success
//     res.send('Message sent to all registered users!');
//     console.log('Message sent to all registered users!');
//   });


  
  // function getTemplatedMessageInput(recipient, message) {
  //   return JSON.stringify({
  //     "messaging_product": "whatsapp",
  //     "to": recipient,
  //     "type": "text",
  //     "text": message
  //   });
  // }

  // const axios = require('axios');

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
  //     "messaging_product": "whatsapp",
  //     "preview_url": false,
  //     "recipient_type": "individual",
  //     "to": recipient,
  //     "type": "text",
  //     "text": {
  //       "body": text
  //     }
  //   });
  // }
  



// Now, create the following API to send the message.
router.post("/we", (req, res) => {
  const msg = req.body.msg;
  client.messages.create({
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+919422334995',
      body: msg
    })
    .then(message => res.send(message))
    .catch(err => {
      console.log(err);
      res.send(err)
    })
});
  

  router.post('/wa',async(req, res, next) => {
    client.messages
  .create({
     mediaUrl: ['https://images.unsplash.com/photo-1545093149-618ce3bcf49d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80'],
     from: 'whatsapp:+919156942812',
     to: 'whatsapp:+919422334995'
   })
  .then(message => console.log(message.sid));
  res.status(200).json({ msg : client.messages , data : client.messages.to})
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