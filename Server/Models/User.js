const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Primary Identifiers
    nic: {
        type: String,
        required: [true, 'NIC is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },

    // Authentication
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false // Don't return password by default
    },

    // User Details
    username: {
        type: String,
        trim: true
    },

    // Account Type
    accountType: {
        type: String,
        enum: ['individual', 'joint', 'corporate'],
        required: true
    },

    // User Role
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Verification Status
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isMobileVerified: {
        type: Boolean,
        default: false
    },
    isKYCCompleted: {
        type: Boolean,
        default: false
    },

    // Account Status
    status: {
        type: String,
        enum: ['active', 'suspended', 'closed'],
        default: 'active'
    },

    // Security
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,

    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Hide deleted users from queries
userSchema.pre(/^find/, function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

// Instance method to check if user can perform transactions
userSchema.methods.canTransact = function () {
    return this.isEmailVerified &&
        this.isMobileVerified &&
        this.isKYCCompleted &&
        this.status === 'active';
};

const User = mongoose.model('User', userSchema);

module.exports = User;
