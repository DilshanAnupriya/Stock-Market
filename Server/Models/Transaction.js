const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // User Reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Transaction Type
    type: {
        type: String,
        enum: ['deposit', 'withdrawal'],
        required: true
    },

    // Fund Reference
    fund: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fund',
        required: true
    },

    // Amount
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    // Transaction Details
    remarks: {
        type: String,
        trim: true
    },

    // Deposit Slip / Proof
    proofDocument: {
        type: String // File path for deposit slip or withdrawal proof
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'otp-sent', 'verified', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },

    // OTP Verification
    otpVerified: {
        type: Boolean,
        default: false
    },
    otpVerifiedAt: Date,

    // Processing Details
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date,
    processingNotes: String,

    // Transaction Reference
    transactionReference: {
        type: String,
        unique: true,
        sparse: true
    },

    // Bank Details (for withdrawals)
    withdrawalBankDetails: {
        accountNumber: String,
        bankName: String,
        branchName: String,
        accountHolderName: String
    },

    // Failure Details
    failureReason: String,

    // Balance Snapshot (at time of transaction)
    balanceBefore: Number,
    balanceAfter: Number,

    // Metadata
    ipAddress: String,
    userAgent: String,
    deviceType: {
        type: String,
        enum: ['web', 'mobile', 'tablet']
    }
}, {
    timestamps: true
});

// Generate transaction reference before saving
transactionSchema.pre('save', async function (next) {
    if (!this.transactionReference && this.status === 'completed') {
        const prefix = this.type === 'deposit' ? 'DEP' : 'WTH';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.transactionReference = `${prefix}-${timestamp}-${random}`;
    }
    next();
});

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionReference: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
