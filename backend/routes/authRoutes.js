const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const SECRET = 'secret123';
const GOOGLE_CLIENT_ID = '559516392697-mum43990jtcio03kloev4ubqgd01q37f.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// Me endpoint (get current user)
router.get('/me', async (req, res) => {
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

    res.json({
      id: user._id,
      name: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Google Login
router.post('/google/login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Invalid token data' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name || email.split('@')[0],
        email,
        password: 'google-oauth' // Mark as Google OAuth user
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, SECRET);

    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email
      },
      token: jwtToken
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Google Register
router.post('/google/register', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Invalid token data' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      // User exists, just log them in
      const jwtToken = jwt.sign({ id: existing._id }, SECRET);
      return res.json({
        user: {
          id: existing._id,
          name: existing.username,
          email: existing.email
        },
        token: jwtToken
      });
    }

    // Create new user
    const user = new User({
      username: name || email.split('@')[0],
      email,
      password: 'google-oauth'
    });

    await user.save();

    const jwtToken = jwt.sign({ id: user._id }, SECRET);

    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email
      },
      token: jwtToken
    });
  } catch (err) {
    console.error('Google register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

module.exports = router;
