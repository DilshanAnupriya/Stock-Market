const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const { protect } = require('../Middleware/authMiddleware');
const { validate, schemas } = require('../Middleware/validationMiddleware');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/verify-otp', validate(schemas.verifyOTP), authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
