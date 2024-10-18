const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendOTP = require('../utils/sendOTP');

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    sendOTP(email, otp);

    res.status(201).json({ message: 'User created. Check your email for OTP.', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email not verified. Please verify your email.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    sendOTP(email, otp);

    res.json({ message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing password reset', error });
  }
};

exports.verifyOTPForPasswordReset = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified, proceed to reset password.' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null; // Clear the OTP after successful password reset
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};

exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;
  console.log(userId)
  const user = await User.findById(userId);
  if (!user) return res.status(400).json({ message: 'User not found' });

  if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  user.isVerified = true;
  await user.save();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'OTP verified', token });
};
