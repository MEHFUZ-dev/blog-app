const nodemailer = require('nodemailer');

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter (using Gmail as example)
// You can replace this with any email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Send OTP via email
async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@winged.com',
      to: email,
      subject: 'Your Winged OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Winged!</h2>
          <p>Your One-Time Password (OTP) for authentication is:</p>
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #4F46E5; text-align: center; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Do not share this OTP with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

// Verify OTP
function verifyOTP(storedOTP, providedOTP, otpExpiry) {
  if (!storedOTP || !providedOTP) {
    return { valid: false, message: 'OTP not found' };
  }

  if (new Date() > new Date(otpExpiry)) {
    return { valid: false, message: 'OTP expired' };
  }

  if (storedOTP !== providedOTP) {
    return { valid: false, message: 'Invalid OTP' };
  }

  return { valid: true, message: 'OTP verified successfully' };
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  verifyOTP
};
