const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    // User Reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // OTP Details
    otpHash: {
        type: String,
        required: true
    },

    // Purpose
    purpose: {
        type: String,
        enum: ['registration', 'login', 'email-verification', 'mobile-verification',
            'transaction', 'password-reset', 'account-opening'],
        required: true
    },

    // Contact Information
    sentTo: {
        type: String, // Email or mobile number
        required: true
    },

    sentVia: {
        type: String,
        enum: ['email', 'sms', 'both'],
        required: true
    },

    // Verification Status
    isVerified: {
        type: Boolean,
        default: false
    },

    verifiedAt: Date,

    // Expiry
    expiresAt: {
        type: Date,
        required: true
    },

    // Attempt Tracking
    attempts: {
        type: Number,
        default: 0
    },

    maxAttempts: {
        type: Number,
        default: 3
    },

    // Related Transaction (if applicable)
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },

    // Metadata
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Hash OTP before saving
// Hash OTP before saving
otpSchema.pre('save', async function () {
    if (!this.isModified('otpHash')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.otpHash = await bcrypt.hash(this.otpHash, salt);
    } catch (error) {
        throw error;
    }
});

// Compare OTP method
otpSchema.methods.compareOTP = async function (candidateOTP) {
    return await bcrypt.compare(candidateOTP, this.otpHash);
};

// Check if OTP is expired
otpSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

// Check if max attempts reached
otpSchema.methods.maxAttemptsReached = function () {
    return this.attempts >= this.maxAttempts;
};

// Auto-delete expired OTPs after 24 hours
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
