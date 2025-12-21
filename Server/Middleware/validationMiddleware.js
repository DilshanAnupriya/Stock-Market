const Joi = require('joi');

/**
 * Validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};

// Validation Schemas

const registerSchema = Joi.object({
    nic: Joi.string()
        .pattern(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/)
        .required()
        .messages({
            'string.pattern.base': 'NIC must be in format 123456789V or 123456789012'
        }),
    mobile: Joi.string()
        .pattern(/^0[0-9]{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Mobile number must be 10 digits starting with 0'
        }),
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number and one special character'
        }),
    username: Joi.string()
        .min(3)
        .max(30)
        .optional(),
    accountType: Joi.string()
        .valid('individual', 'joint', 'corporate')
        .required()
});

const loginSchema = Joi.object({
    identifier: Joi.string().required(), // Can be NIC, email, or mobile
    password: Joi.string().required()
});

const verifyOTPSchema = Joi.object({
    otpId: Joi.string().required(),
    otpCode: Joi.string().length(6).required()
});

const personalDetailsSchema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    dob: Joi.string().required(), // Accepts date string
    address: Joi.string().required(),
    city: Joi.string().required(),
    district: Joi.string().required(),
    postalCode: Joi.string().required(),
    // Keep these optional/valid if frontend starts sending them
    title: Joi.string().valid('Mr', 'Mrs', 'Miss', 'Dr', 'Rev').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    phoneNumber: Joi.string().pattern(/^0[0-9]{9}$/).optional(),
    alternateEmail: Joi.string().email().optional()
});

const bankDetailsSchema = Joi.object({
    accountNumber: Joi.string().min(5).max(20).required(),
    bankName: Joi.string().required(),
    branchName: Joi.string().required(),
    accountType: Joi.string().valid('savings', 'current').required()
});

const employmentDetailsSchema = Joi.object({
    isPEP: Joi.boolean().default(false),
    purposeResidentialStatus: Joi.string().optional(),
    modeOfTransaction: Joi.string().valid('online', 'branch', 'both').required(),
    occupation: Joi.string().required(),
    employer: Joi.string().optional(),
    monthlyIncome: Joi.string()
        .valid('below-50k', '50k-100k', '100k-250k', '250k-500k', 'above-500k')
        .required()
});

const nomineeSchema = Joi.object({
    nominees: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            relationship: Joi.string().required(),
            nic: Joi.string().min(10).required(),
            contactNumber: Joi.string().allow('', null).optional(), // Allow empty string
            percentage: Joi.number().min(0).max(100).required()
        })
    ).min(1).required()
});


const depositSchema = Joi.object({
    fundId: Joi.string().required(),
    amount: Joi.number().min(100).required(),
    remarks: Joi.string().max(500).optional()
});

const withdrawalSchema = Joi.object({
    fundId: Joi.string().required(),
    amount: Joi.number().min(100).required(),
    remarks: Joi.string().max(500).optional(),
    withdrawalBankDetails: Joi.object({
        accountNumber: Joi.string().required(),
        bankName: Joi.string().required(),
        branchName: Joi.string().required(),
        accountHolderName: Joi.string().required()
    }).optional()
});

const declarationSchema = Joi.object({
    accepted: Joi.boolean().valid(true).required().messages({
        'any.only': 'You must accept the declaration to proceed'
    }),
    selectedFunds: Joi.array().items(Joi.string()).min(1).required()
});

module.exports = {
    validate,
    schemas: {
        register: registerSchema,
        login: loginSchema,
        verifyOTP: verifyOTPSchema,
        personalDetails: personalDetailsSchema,
        bankDetails: bankDetailsSchema,
        employmentDetails: employmentDetailsSchema,
        nominee: nomineeSchema,
        deposit: depositSchema,
        withdrawal: withdrawalSchema,
        declaration: declarationSchema
    }
};
