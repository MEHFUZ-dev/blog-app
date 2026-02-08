const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');

const SECRET = 'secret123';
const GOOGLE_CLIENT_ID = '559516392697-19mmpvsm8u9pmli96k6fft0ceqibgann.apps.googleusercontent.com';

// Verify Google token by calling Google's API
async function verifyGoogleToken(token) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    return response.data;
  } catch (error) {
    // If access_token verification fails, try ID token verification
    try {
      const response = await axios.post(
        `https://oauth2.googleapis.com/tokeninfo`,
        null,
        { params: { id_token: token } }
      );
      return response.data;
    } catch (err) {
      throw new Error('Invalid token: ' + err.message);
    }
  }
}

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
    console.log('🔵 Google Login Request');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ message: 'No token provided' });
    }

    // Decode JWT token to get user data
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.email) {
      console.log('❌ Invalid token format');
      return res.status(400).json({ message: 'Invalid token' });
    }

    const { email, name, picture } = decoded;
    console.log('✅ Token decoded - Email:', email);

    // Find or create user
    console.log('🔵 Finding user:', email);
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('✅ Creating new user:', email);
      user = new User({
        username: name || email.split('@')[0],
        email,
        password: 'google-oauth'
      });
      await user.save();
      console.log('✅ User saved');
    } else {
      console.log('✅ User found');
    }

    // Create JWT token for this application
    const appToken = jwt.sign({ id: user._id }, SECRET);
    console.log('✅ App token generated');

    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email
      },
      token: appToken
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Google Register (same as login - creates account if doesn't exist)
router.post('/google/register', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('🔵 Google Register Request');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ message: 'No token provided' });
    }

    // Decode JWT token to get user data
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.email) {
      console.log('❌ Invalid token format');
      return res.status(400).json({ message: 'Invalid token' });
    }

    const { email, name, picture } = decoded;
    console.log('✅ Token decoded - Email:', email);

    // Check if user exists
    console.log('🔵 Checking user:', email);
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('✅ Creating new user:', email);
      user = new User({
        username: name || email.split('@')[0],
        email,
        password: 'google-oauth'
      });
      await user.save();
      console.log('✅ User saved');
    } else {
      console.log('✅ User already exists');
    }

    // Create JWT token for this application
    const appToken = jwt.sign({ id: user._id }, SECRET);
    console.log('✅ App token generated');

    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email
      },
      token: appToken
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

module.exports = router;
