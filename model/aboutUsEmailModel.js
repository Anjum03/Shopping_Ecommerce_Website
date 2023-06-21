

const mongoose = require('mongoose');

const aboutUsEmailSchema = new mongoose.Schema({
    Email: String, //
    subject: String,
    message: String,

}, {
    timestamps: true
});


module.exports = mongoose.model('AboutUsEmail', aboutUsEmailSchema);
