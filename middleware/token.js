
const User = require('../model/userModel')
const Admin = require('../model/adminModel');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) return console.log("No token provided"), res.status(401).json({ message: 'No token provided.' });
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decoded) {
      if (err) return console.log("Falied to authenticate token ....") ,res.status(500).json({ message: 'Failed to authenticate token.' });
  
      req.user = decoded;
      next();
    });
  }


  const isAdmin = (req, res, next) => {
    const adminId = req.user.id;
    Admin.findById(adminId)
      .then(admin => {
        if (!admin) {
          return res.status(403).json({ message: 'Only admin can do that' });
        }
        next();
      })
      .catch(err => {
        return res.status(500).json({ message: 'Internal Server Error' });
      });
  };
  


module.exports = {verifyToken, isAdmin} ;