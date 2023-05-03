
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // phone:{ type: Number},
    description:{ type: String, },
    
},
{
  timestamps: true
});

const NotificationSchema = mongoose.model('Banner',notificationSchema);

module.exports = NotificationSchema;
