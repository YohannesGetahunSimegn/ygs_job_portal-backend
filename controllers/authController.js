const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendOTP = require('../utils/sendOTP');

exports.signup = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body; // Default role to 'user'

  try {
    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return res.status(400).json({ message: `An account with this email already exists` });
    }


    // Proceed with creating a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role  // role can be 'user' or 'admin' based on request body
    });

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // Send OTP to the user's email
    sendOTP(email, otp);

    // Respond with success message and user data
    res.status(201).json({
      message: 'User created. Check your email for OTP.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};


exports.login = async (req, res) => {
  const { email, password, role = 'user' } = req.body;

  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: `No account with this role (${role}) and email found.` });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified. Please verify your email.', userId: user._id });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const tokenExpiration = Math.floor(Date.now() / 1000) + 3600; // Expiration time in seconds

    res.status(200).json({ userId: user._id, token, role: user.role, tokenExpiration });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again.', error });
  }
};



exports.forgotPassword = async (req, res) => {
  const { email, role } = req.body; // Include role in the request body
  console.log(email, role)
  try {
    // Find user by both email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: 'User not found or role mismatch' });
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    sendOTP(email, otp);

    res.json({ userId: user._id, message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing password reset', error });
  }
};


exports.verifyOTPForPasswordReset = async (req, res) => {
  const { email, otp, role } = req.body; // Include role in the request body

  try {
    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: 'User not found or role mismatch' });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified, proceed to reset password.' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, newPassword, role } = req.body; // Include role in the request body

  try {
    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: 'User not found or role mismatch' });
    }

    // Hash the new password and save it
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
  const { userId, otp, role } = req.body;  // Include role in the request body

  try {
    // Find user by both userId and role
    const user = await User.findOne({ _id: userId, role: role });
    if (!user) {
      return res.status(400).json({ message: 'User not found or role mismatch' });
    }
    console.log('Stored OTP:', user.otp, 'Received OTP:', otp);
    // Ensure OTP matches
    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Generate a token including the role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'OTP verified successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error });
  }
};



exports.resendOTP = async (req, res) => {
  const { email, role } = req.body;  // Include role in the request body

  try {
    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: 'User not found or role mismatch' });
    }

    // Generate a new OTP and update it in the user's document
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    // Send OTP via email
    sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resending OTP', error });
  }
};
