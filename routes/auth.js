const express = require('express');
const router = express.Router();
const passport = require('../config/passport-setup');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const auth = require('../config/auth.js')

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/discography');
  }
  res.render('login', { title: 'login', errorMessage: req.flash('error') });
});

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.render('signup', { title: 'signup', errorMessage: 'Username or email already taken' });
      }
  
      const newUser = new User({
        username,
        email,
        password,
      });
  
      await newUser.save();
  
      res.render('login', { title: 'login', errorMessage: 'Signup successful, please login.' });
    } catch (error) {
      console.error('Error signing up user:', error);
      res.render('signup', { title: 'signup', errorMessage: 'Error signing up user' });
    }
  });

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'signup', errorMessage: '' });
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/discography',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

module.exports = router;