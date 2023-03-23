require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../model/userModel');
const { verifyToken } = require('../middleware/token');



//user Register
router.post('/register', async (req, res) => {
    try {

        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });

        if (password.length < 8) {
            return res.status(400).json({ message: "Password less than 6 characters" })
        }

        if (userExists) {
            res.status(400).json({ success: false, error: 'Email already registered' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword, phone });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "8d" });

        res.status(201).json({ success: true, token });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//user Login
router.post('/login',verifyToken, async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({ success: false, error: 'User Invalid/Invalid credentials' });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(400).json({ message: "`Password Wrong" })
        }

        const isAdmin = user.isAdmin;

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "8d" });

        res.status(200).json({ success: true, token, isAdmin, message: isAdmin ? 'Admin logged in successfully' : 'User logged in successfully' });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
})


//user get with pagination
router.get('/user', verifyToken, async (req, res) => {
    try {

        let user ;

        const qNew = req.query.new;
        if(qNew){
            user = await User.find().sort({createdAt: -1}).limit(10)
        }else{
            user = await User.find();
        }
        
        res.status(200).json({ success: true, data: user });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }

})


//logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logout' });
});


//update user by id
router.put('/user/:id', verifyToken, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        let hashedPassword = password;
        if(password){

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findOneAndUpdate({_id: req.params.id}, { name, email, password:hashedPassword, phone }, { new: true });

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


//delete user
router.delete('/user/:id', verifyToken, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: deletedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});



module.exports = router;

