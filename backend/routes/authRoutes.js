const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const SECRET = 'secret123';
const GOOGLE_CLIENT_ID = '559516392697-19mmpvsm8u9pmli96k6fft0ceqibgann.apps.googleusercontent.com';
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
    console.log('🔵 Google Login Request - Token length:', token ? token.length : 'no token');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ message: 'No token provided' });
    }

    // Verify Google token
    let ticket;
    try {
      console.log('🔵 Verifying token with Google Client...');
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
      console.log('✅ Token verified successfully');
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      return res.status(400).json({ message: 'Invalid Google token: ' + err.message });
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    console.log('✅ Token payload extracted - Email:', email);

    if (!email) {
      console.log('❌ No email in token payload');
      return res.status(400).json({ message: 'Invalid token data' });
    }

    // Find or create user
    console.log('🔵 Finding or creating user for:', email);
    let user = await User.findOne({ email });
    if (!user) {
      console.log('✅ Creating new user:', email);
      user = new User({
        username: name || email.split('@')[0],
        email,
        password: 'google-oauth'
      });
      await user.save();
      console.log('✅ User created successfully');
    } else {
      console.log('✅ User found:', user._id);
    }

    const jwtToken = jwt.sign({ id: user._id }, SECRET);
    console.log('✅ JWT token generated');

    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email
      },
      token: jwtToken
    });
  } catch (err) {
    console.error('❌ Google login error:', err);
    res.status(500).json({ message: 'Authentication failed: ' + err.message });
  }
});

// Google Register
router.post('/google/register', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('🔵 Google Register Request - Token length:', token ? token.length : 'no token');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ message: 'No token provided' });
    }

    // Verify Google token
    let ticket;
    try {
      console.log('🔵 Verifying token with Google Client...');
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });
      console.log('✅ Token verified successfully');
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      return res.status(400).json({ message: 'Invalid Google token: ' + err.message });
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    console.log('✅ Token payload extracted - Email:', email);

    if (!email) {
      console.log('❌ No email in token payload');
      return res.status(400).json({ message: 'Invalid token data' });
    }

    // Check if user already exists
    console.log('🔵 Checking if user exists:', email);
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('✅ User already exists, logging in:', email);
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
    console.log('✅ Creating new user:', email);
    const user = new User({
      username: name || email.split('@')[0],
      email,
      password: 'google-oauth'
    });

    await user.save();
    console.log('✅ User saved successfully');

    const jwtToken = jwt.sign({ id: user._id }, SECRET);
    console.log('✅ JWT token generated');

    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email
      },
      token: jwtToken
    });
  } catch (err) {
    console.error('❌ Google register error:', err);
    res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
});

module.exports = router;
