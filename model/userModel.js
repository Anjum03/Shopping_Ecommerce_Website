const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, },
  lastName: { type: String, },
  email: { type: String, },
  address: [{ type: String }],
  password: { type: String, },
  phone: { type: Number, },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});



//forgot password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
// });




module.exports = mongoose.model('User', userSchema);
