const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
    // Fund Details
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },

    type: {
        type: String,
        enum: ['money-market', 'equity', 'bond', 'balanced', 'index'],
        required: true
    },

    description: {
        type: String,
        required: true
    },

    // Investment Details
    minimumInvestment: {
        type: Number,
        required: true,
        default: 1000
    },

    minimumWithdrawal: {
        type: Number,
        default: 500
    },

    // NAV (Net Asset Value)
    currentNAV: {
        type: Number,
        required: true,
        default: 1.0
    },

    navHistory: [{
        date: {
            type: Date,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    }],

    // Performance Metrics
    returns: {
        oneMonth: Number,
        threeMonths: Number,
        sixMonths: Number,
        oneYear: Number,
        threeYears: Number,
        fiveYears: Number,
        sinceInception: Number
    },

    // Fund Information
    inceptionDate: {
        type: Date,
        required: true
    },

    fundManager: {
        type: String,
        required: true
    },

    managementFee: {
        type: Number,
        default: 0
    },

    // Risk Profile
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },

    isOpenForInvestment: {
        type: Boolean,
        default: true
    },

    // Additional Information
    features: [String],

    documents: [{
        name: String,
        url: String,
        type: {
            type: String,
            enum: ['prospectus', 'fact-sheet', 'annual-report', 'other']
        }
    }],

    // Total Assets Under Management
    totalAUM: {
        type: Number,
        default: 0
    },

    // Investor Count
    investorCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Update NAV history when NAV changes
fundSchema.pre('save', function (next) {
    if (this.isModified('currentNAV')) {
        this.navHistory.push({
            date: new Date(),
            value: this.currentNAV
        });

        // Keep only last 365 days of NAV history
        if (this.navHistory.length > 365) {
            this.navHistory = this.navHistory.slice(-365);
        }
    }
    next();
});

// Virtual for fund age
fundSchema.virtual('fundAge').get(function () {
    const now = new Date();
    const inception = new Date(this.inceptionDate);
    const diffTime = Math.abs(now - inception);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return { years, months, days: diffDays };
});

const Fund = mongoose.model('Fund', fundSchema);

module.exports = Fund;
