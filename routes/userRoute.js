require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../model/userModel');
const { verifyToken } = require('../middleware/token');
const multer = require("multer");



//user Register
router.post('/register', async (req, res) => {
    try {

        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log("Email Already Exist")
            res.status(400).json({ success: false, error: 'Email already registered' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword, phone });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" });

        res.status(201).json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//user Login
router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            console.log("Invalid Creditals")
            res.status(401).json({ success: false, error: 'User Invalid//////Invalid credentials' });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log("Password  wrong")
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "3d" });

        const isAdmin = user.isAdmin;

        if (isAdmin) {
            // handle admin login
            res.status(200).json({ success: true, token, isAdmin, message: 'Admin logged in successfully' });
        } else {
            // handle regular user login
            res.status(200).json({ success: true, token, isAdmin, message: 'User logged in successfully' });
        }

        res.status(200).json({ success: true, token, isAdmin });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
})

//user get
router.get('/user', verifyToken, async (req, res) => {
    try {

        const user = await User.find().select('-password');
        res.status(200).json({ success: true, data: user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }

})


//update user
router.put('/user/:id', verifyToken, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, password: hashedPassword, phone }, { new: true });
        
        if (!updatedUser) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//delete user
router.delete('/user/:id', verifyToken, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, data: deletedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



module.exports = router;