const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendOTPEmail, verifyOTP } = require('../utils/otpService');

const SECRET = 'secret123';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = new User({
    username: name,
    email,
    password: hashed,
    otp,
    otpExpiry,
    isOtpVerified: false
  });

  await user.save();

  // Send OTP email
  await sendOTPEmail(email, otp);

  res.json({
    message: 'User registered. OTP sent to email. Please verify to complete registration.',
    userId: user._id,
    email: user.email,
    requiresOtp: true
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

  // Generate and send OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send OTP email
  await sendOTPEmail(email, otp);

  res.json({
    message: 'OTP sent to your email. Please verify to login.',
    userId: user._id,
    email: user.email,
    requiresOtp: true
  });
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  const { userId, otp, type } = req.body; // type: 'login' or 'register'

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const verification = verifyOTP(user.otp, otp, user.otpExpiry);
  if (!verification.valid) {
    return res.status(400).json({ message: verification.message });
  }

  // Mark OTP as verified and generate token
  user.isOtpVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '24h' });

  res.json({
    message: 'OTP verified successfully',
    user: {
      id: user._id,
      name: user.username,
      email: user.email
    },
    token
  });
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send OTP email
  await sendOTPEmail(user.email, otp);

  res.json({
    message: 'OTP resent to your email',
    email: user.email
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

// Me endpoint (get current user without restriction)
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

module.exports = router;
