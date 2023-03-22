
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../model/adminModel');
const { verifyToken, isAdmin } = require('../middleware/token');


//create a admin account
router.post('/admin/register', function (req, res) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    // Define a new admin user object
    const admin = new Admin({
        username: req.body.username,
        password: hashedPassword
    });
    // Save the admin user object to the MongoDB database
    admin.save()
        .then(result => {
            res.status(201).json({success:true, message: "Admin created successfully ..." })
        })
        .catch(err => {
                res.status(500).json({ success: false, error: 'Server error' });
        })
});


//login
router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    // Check if admin exists
    if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin Not Found' });
    }
    // Check if password is correct
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
        return res.status(400).json({ success: false, message: 'Invalid Password' });
    }
    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY);
    res.json({ token: token });

});



router.get('/admin/dashboard', verifyToken,isAdmin, function (req, res) {

    // Only accessible to authenticated admins
    res.send("Welcome to Admin DashBoard ....");
});



router.post('/logout',verifyToken,isAdmin, (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout' });
  });




module.exports = router