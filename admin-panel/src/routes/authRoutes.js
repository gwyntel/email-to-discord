const express = require('express');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if first user, if so make them admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'viewer';

    const user = new User({ 
      username, 
      email, 
      role 
    });

    await User.register(user, password);
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      role 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User login
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({
    message: 'Login successful',
    user: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// User logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;
