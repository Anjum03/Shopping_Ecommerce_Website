

const mongoose = require('mongoose');

const aboutUsEmailSchema = new mongoose.Schema({
    name : String ,
    email: String, //
    subject: String,
    message: String,

}, {
    timestamps: true
});



module.exports = mongoose.model('AboutUsEmail', aboutUsEmailSchema);
