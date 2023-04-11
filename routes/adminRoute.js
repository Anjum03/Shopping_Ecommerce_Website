
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../model/adminModel');
const { verifyAdminToken, isAdmin } = require('../middleware/token');


//admin Register
router.post('/admin/register', async (req, res) => {
    try {

        const { email, password, role } = req.body;

        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            res.status(400).json({ success: false, error: 'Email already registered' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({  email, password: hashedPassword,role });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: "8d" });

        res.status(201).json({ success: true,  admin ,token });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//login
router.post('/admin/login', async (req, res) => {

    try{

        const { email, password } = req.body;
    
        const admin = await Admin.findOne({email });
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
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY,{ expiresIn: "8d" });
        res.json({ token: token });
    } catch(error){
        res.status(500).json({ success: false, error: 'Server error' });
    }


});



router.get('/admin/dashboard',verifyAdminToken,isAdmin,  function (req, res) {

    // Only accessible to authenticated admins
    res.send("Welcome to Admin DashBoard ....");
});



router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout' });
  });




module.exports = router