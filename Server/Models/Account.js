const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    // User Reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Personal Details
    title: {
        type: String,
        enum: ['Mr', 'Mrs', 'Miss', 'Dr', 'Rev'],
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },

    // Permanent Address
    permanentAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        postalCode: { type: String, required: true }
    },

    // Correspondence Address
    correspondenceAddress: {
        sameAsPermanent: { type: Boolean, default: true },
        street: String,
        city: String,
        province: String,
        postalCode: String
    },

    // Contact Details
    phoneNumber: {
        type: String,
        required: true
    },
    alternateEmail: String,

    // NIC Documents
    nicFrontImage: {
        type: String, // File path
        required: true
    },
    nicBackImage: {
        type: String, // File path
        required: true
    },
    nicVerified: {
        type: Boolean,
        default: false
    },

    // Bank Details
    bankDetails: {
        accountNumber: {
            type: String,
            required: true
        },
        bankName: {
            type: String,
            required: true
        },
        branchName: {
            type: String,
            required: true
        },
        accountType: {
            type: String,
            enum: ['savings', 'current'],
            required: true
        }
    },
    bankBookImage: {
        type: String, // File path
        required: true
    },

    // Billing Proof
    billingProofImage: {
        type: String, // File path
        required: true
    },
    billingProofType: {
        type: String,
        enum: ['electricity', 'water', 'telephone', 'internet', 'other']
    },

    // E-KYC Employment Details
    employmentDetails: {
        isPEP: { // Politically Exposed Person
            type: Boolean,
            default: false
        },
        purposeResidentialStatus: String,
        modeOfTransaction: {
            type: String,
            enum: ['online', 'branch', 'both']
        },
        occupation: String,
        employer: String,
        monthlyIncome: {
            type: String,
            enum: ['below-50k', '50k-100k', '100k-250k', '250k-500k', 'above-500k']
        }
    },

    // Nominees
    nominees: [{
        name: {
            type: String,
            required: true
        },
        relationship: {
            type: String,
            required: true
        },
        nic: {
            type: String,
            required: true
        },
        contactNumber: String,
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        }
    }],

    // Video KYC
    videoKYCPath: String,
    videoKYCVerified: {
        type: Boolean,
        default: false
    },
    videoKYCNotes: String,

    // Declaration
    declarationAccepted: {
        type: Boolean,
        default: false
    },
    declarationDate: Date,
    declarationIP: String,

    // Investment Product Selection
    selectedFunds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fund'
    }],

    // Application Status
    applicationStatus: {
        type: String,
        enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected'],
        default: 'draft'
    },

    // Review Details
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    rejectionReason: String,

    // Completion Tracking
    completionSteps: {
        personalDetails: { type: Boolean, default: false },
        nicUpload: { type: Boolean, default: false },
        bankDetails: { type: Boolean, default: false },
        bankBookUpload: { type: Boolean, default: false },
        billingProofUpload: { type: Boolean, default: false },
        employmentDetails: { type: Boolean, default: false },
        nomineeDetails: { type: Boolean, default: false },
        videoKYC: { type: Boolean, default: false },
        declaration: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Calculate completion percentage
accountSchema.virtual('completionPercentage').get(function () {
    const steps = this.completionSteps;
    const completed = Object.values(steps).filter(Boolean).length;
    const total = Object.keys(steps).length;
    return Math.round((completed / total) * 100);
});

// Validate nominee percentages sum to 100
accountSchema.pre('save', function (next) {
    if (this.nominees && this.nominees.length > 0) {
        const totalPercentage = this.nominees.reduce((sum, nominee) => sum + nominee.percentage, 0);
        if (totalPercentage !== 100) {
            return next(new Error('Nominee percentages must sum to 100%'));
        }
    }
    next();
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
