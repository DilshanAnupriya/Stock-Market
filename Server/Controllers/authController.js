const User = require('../Models/User');
const OTPService = require('../Utils/otpService');
const EmailService = require('../Utils/emailService');
const SMSService = require('../Utils/smsService');
const { sendTokenResponse } = require('../Middleware/authMiddleware');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const { nic, mobile, email, password, username, accountType } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ nic }, { email }, { mobile }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this NIC, email, or mobile number already exists'
            });
        }

        // Create user
        const user = await User.create({
            nic,
            mobile,
            email,
            password,
            username: username || email.split('@')[0],
            accountType
        });

        // Generate OTP for email verification
        const emailOTP = await OTPService.createOTP(
            user._id,
            'email-verification',
            email,
            'email'
        );

        // Generate OTP for mobile verification
        const mobileOTP = await OTPService.createOTP(
            user._id,
            'mobile-verification',
            mobile,
            'sms'
        );

        // Send OTPs
        await EmailService.sendOTP(email, emailOTP.otpCode, 'email-verification');
        await SMSService.sendOTP(mobile, mobileOTP.otpCode, 'mobile-verification');

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email and mobile number.',
            data: {
                userId: user._id,
                emailOTPId: emailOTP.otpId,
                mobileOTPId: mobileOTP.otpId,
                email: user.email,
                mobile: user.mobile
            }
        });
    } catch (error) {
        console.error('Registration error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

        // Handle Duplicate Key Error (e.g. if soft deleted user exists)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists.`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { otpId, otpCode, userId } = req.body;

        const result = await OTPService.verifyOTP(otpId, otpCode, userId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Update user verification status based on OTP purpose
        const user = await User.findById(userId);

        if (result.otp.purpose === 'email-verification') {
            user.isEmailVerified = true;
        } else if (result.otp.purpose === 'mobile-verification') {
            user.isMobileVerified = true;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                isEmailVerified: user.isEmailVerified,
                isMobileVerified: user.isMobileVerified
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed',
            error: error.message
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Find user by NIC, email, or mobile
        const user = await User.findOne({
            $or: [
                { nic: identifier.toUpperCase() },
                { email: identifier.toLowerCase() },
                { mobile: identifier }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Send token response
        sendTokenResponse(user, 200, res, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOTP = async (req, res) => {
    try {
        const { userId, purpose, sentTo, sentVia } = req.body;

        const result = await OTPService.resendOTP(userId, purpose, sentTo, sentVia);

        if (!result.success) {
            return res.status(400).json(result);
        }

        // Send OTP
        if (sentVia === 'email' || sentVia === 'both') {
            await EmailService.sendOTP(sentTo, result.otpCode, purpose);
        }
        if (sentVia === 'sms' || sentVia === 'both') {
            await SMSService.sendOTP(sentTo, result.otpCode, purpose);
        }

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully',
            data: {
                otpId: result.otpId,
                expiresAt: result.expiresAt
            }
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP',
            error: error.message
        });
    }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res) => {
    try {
        const { username, mobile, email } = req.body;

        // Find user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for duplicates if updating sensitive fields
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingEmail) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email;
            user.isEmailVerified = false;
        }

        if (mobile && mobile !== user.mobile) {
            const existingMobile = await User.findOne({ mobile, _id: { $ne: user._id } });
            if (existingMobile) {
                return res.status(400).json({ success: false, message: 'Mobile number already in use' });
            }
            user.mobile = mobile;
            user.isMobileVerified = false;
        }

        if (username) user.username = username;

        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

module.exports = exports;
