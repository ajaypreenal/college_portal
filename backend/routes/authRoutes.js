const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register (admin creates users)
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body); // plain password; pre-save hashes
    await user.save();
    res.json({ message: 'User created', user: { id: user._id, email: user.email, role: user.role }});
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`Login failed: No user found -> ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      console.error(`Login failed: Wrong password -> ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Missing JWT_SECRET in .env');
      return res.status(500).json({ message: 'Server config error' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
