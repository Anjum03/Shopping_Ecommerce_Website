const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
  
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'admin'
  }
},{
  timestamps:true
});

module.exports = mongoose.model('Admin', adminSchema);
