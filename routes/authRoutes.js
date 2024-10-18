const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/verify-otp', authController.verifyOTP)

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.REACT_APP_BASE_URL_CLIENT}/login` }),
    (req, res) => {
        res.redirect(`${process.env.REACT_APP_BASE_URL_CLIENT}/dashboard`);
    }
);

router.post('/forgot-password', authController.forgotPassword);

router.post('/verify-otp-password-reset', authController.verifyOTPForPasswordReset);

router.post('/reset-password', authController.resetPassword);


module.exports = router;
