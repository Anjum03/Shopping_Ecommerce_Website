const User = require('../model/userModel')
const Admin = require('../model/adminModel');
const jwt = require('jsonwebtoken');

function verifyUserToken(req, res, next) {
  const token = req.headers['authorization'].split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
    if (err) return console.log("Failed to authenticate user token ...."), res.status(500).json({ message: 'Failed to authenticate user token.' });

    req.user = decoded;

    next();
  });
}

function verifyAdminToken(req, res, next) {
  const token = req.headers['authorization'].split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
    if (err) return console.log("Failed to authenticate admin token ...."),
      res.status(500).json({ message: 'Failed to authenticate admin token.' });

    req.admin = decoded;

    next();
  });
}

const isAdmin = async (req, res, next) => {
  const adminId = req.admin.id;

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

module.exports = {
  
  verifyUserToken,
  verifyAdminToken,
  isAdmin

}

// if status = pulish --> no need ask token -->  admin and user can view publish status of category
// if status = unpulish -->need to ask token --> only  admin can view publish and unpulish status of category
