const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = 'secret123';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    username: name,
    email,
    password: hashed
  });

  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({
    user: { id: user._id, name, email },
    token
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({
    user: {
      id: user._id,
      name: user.username,
      email: user.email
    },
    token
  });
});

// Get current user profile (only for ansar@gmail.com)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow access for ansar@gmail.com
    if (user.email !== 'ansar@gmail.com') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      id: user._id,
      name: user.username,
      email: user.email,
      role: user.role || 'user'
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
