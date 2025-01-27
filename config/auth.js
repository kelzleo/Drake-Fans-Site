// middleware/auth.js
const User = require('../models/users');

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).send('Access denied. Admins only.');
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Please log in to perform this action.');
}

module.exports = { isAdmin, isAuthenticated };