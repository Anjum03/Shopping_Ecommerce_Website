
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', },
    message: { type: String },
    statusUpdate: { type: String, enum: ['Typing', 'Delivered', 'Failed' ], },
    isRead: { type: Boolean, default: false, },

},{    timestamps: true }
);

const NotificationSchema = mongoose.model('Notification', notificationSchema);

module.exports = NotificationSchema;
