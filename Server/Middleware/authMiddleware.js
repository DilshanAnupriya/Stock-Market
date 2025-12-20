const jwt = require('jsonwebtoken');
const User = require('../Models/User');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Token invalid.'
                });
            }

            // Check if user account is active
            if (req.user.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been suspended or closed.'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or has expired'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

/**
 * Check if user has completed KYC
 */
const requireKYC = async (req, res, next) => {
    try {
        if (!req.user.isKYCCompleted) {
            return res.status(403).json({
                success: false,
                message: 'Please complete your KYC verification to access this feature'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'KYC verification check failed',
            error: error.message
        });
    }
};

/**
 * Check if user can perform transactions
 */
const canTransact = async (req, res, next) => {
    try {
        if (!req.user.canTransact()) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email, mobile, and complete KYC to perform transactions',
                verificationStatus: {
                    emailVerified: req.user.isEmailVerified,
                    mobileVerified: req.user.isMobileVerified,
                    kycCompleted: req.user.isKYCCompleted
                }
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Transaction permission check failed',
            error: error.message
        });
    }
};

/**
 * Authorize specific roles
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

/**
 * Send token response
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
    const token = generateToken(user._id);

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: {
            id: user._id,
            nic: user.nic,
            email: user.email,
            mobile: user.mobile,
            username: user.username,
            accountType: user.accountType,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isMobileVerified: user.isMobileVerified,
            isKYCCompleted: user.isKYCCompleted,
            status: user.status
        }
    });
};

module.exports = {
    protect,
    requireKYC,
    canTransact,
    authorize,
    generateToken,
    sendTokenResponse
};
