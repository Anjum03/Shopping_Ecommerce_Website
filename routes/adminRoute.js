
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
            console.log(result);
            res.status(201).json({ message: "Admin created successfully ..." })
        })
        .catch(err => {
            console.log(err => {
                console.log(err);
                res.status(500).json({ error: err });
            });
        })
});

router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    // Check if admin exists
    if (!admin) {
        console.log("Admin not found")
        return res.status(404).json("Admin not Found");
    }
    // Check if password is correct
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
        console.log("Invalid Password");
        return res.status(400).json("Invalid Password");
    }
    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY);
    console.log(token);
    res.json({ token: token });

});


router.get('/admin/dashboard', verifyToken,isAdmin, function (req, res) {

    // Only accessible to authenticated admins
    console.log("Welcome to Admin Dashnoard");
    res.send("Welcome to Admin DashBoard ....");
});







module.exports = router