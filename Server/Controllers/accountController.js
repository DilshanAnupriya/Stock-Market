const Account = require('../Models/Account');
const User = require('../Models/User');
const Fund = require('../Models/Fund');

/**
 * @desc    Submit personal details (Step 1)
 * @route   POST /api/account/personal-details
 * @access  Private
 */
exports.submitPersonalDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const personalData = req.body;

        // Check if account already exists
        let account = await Account.findOne({ user: userId });

        if (account) {
            // Update existing account
            Object.assign(account, personalData);
            account.completionSteps.personalDetails = true;
        } else {
            // Create new account
            account = await Account.create({
                user: userId,
                ...personalData,
                completionSteps: { personalDetails: true }
            });
        }

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Personal details saved successfully',
            data: account
        });
    } catch (error) {
        console.error('Personal details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save personal details',
            error: error.message
        });
    }
};

/**
 * @desc    Upload NIC documents (Step 2)
 * @route   POST /api/account/upload-nic
 * @access  Private
 */
exports.uploadNIC = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.files || !req.files.nicFront || !req.files.nicBack) {
            return res.status(400).json({
                success: false,
                message: 'Please upload both NIC front and back images'
            });
        }

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete personal details first'
            });
        }

        account.nicFrontImage = req.files.nicFront[0].path;
        account.nicBackImage = req.files.nicBack[0].path;
        account.completionSteps.nicUpload = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'NIC documents uploaded successfully',
            data: {
                nicFrontImage: account.nicFrontImage,
                nicBackImage: account.nicBackImage
            }
        });
    } catch (error) {
        console.error('NIC upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload NIC documents',
            error: error.message
        });
    }
};

/**
 * @desc    Submit bank details (Step 3)
 * @route   POST /api/account/bank-details
 * @access  Private
 */
exports.submitBankDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const bankData = req.body;

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete personal details first'
            });
        }

        account.bankDetails = bankData;
        account.completionSteps.bankDetails = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Bank details saved successfully',
            data: account.bankDetails
        });
    } catch (error) {
        console.error('Bank details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save bank details',
            error: error.message
        });
    }
};

/**
 * @desc    Upload bank book (Step 4)
 * @route   POST /api/account/upload-bank-book
 * @access  Private
 */
exports.uploadBankBook = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload bank book image'
            });
        }

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete previous steps first'
            });
        }

        account.bankBookImage = req.file.path;
        account.completionSteps.bankBookUpload = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Bank book uploaded successfully',
            data: {
                bankBookImage: account.bankBookImage
            }
        });
    } catch (error) {
        console.error('Bank book upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload bank book',
            error: error.message
        });
    }
};

/**
 * @desc    Upload billing proof (Step 5)
 * @route   POST /api/account/upload-billing-proof
 * @access  Private
 */
exports.uploadBillingProof = async (req, res) => {
    try {
        const userId = req.user._id;
        const { billingProofType } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload billing proof'
            });
        }

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete previous steps first'
            });
        }

        account.billingProofImage = req.file.path;
        account.billingProofType = billingProofType;
        account.completionSteps.billingProofUpload = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Billing proof uploaded successfully',
            data: {
                billingProofImage: account.billingProofImage,
                billingProofType: account.billingProofType
            }
        });
    } catch (error) {
        console.error('Billing proof upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload billing proof',
            error: error.message
        });
    }
};

/**
 * @desc    Submit employment details (Step 6)
 * @route   POST /api/account/employment-details
 * @access  Private
 */
exports.submitEmploymentDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const employmentData = req.body;

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete previous steps first'
            });
        }

        account.employmentDetails = employmentData;
        account.completionSteps.employmentDetails = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Employment details saved successfully',
            data: account.employmentDetails
        });
    } catch (error) {
        console.error('Employment details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save employment details',
            error: error.message
        });
    }
};

/**
 * @desc    Add nominees (Step 7)
 * @route   POST /api/account/nominee
 * @access  Private
 */
exports.addNominee = async (req, res) => {
    try {
        const userId = req.user._id;
        const { nominees } = req.body;

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete previous steps first'
            });
        }

        account.nominees = nominees;
        account.completionSteps.nomineeDetails = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Nominees added successfully',
            data: account.nominees
        });
    } catch (error) {
        console.error('Nominee error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add nominees',
            error: error.message
        });
    }
};

/**
 * @desc    Upload video KYC (Step 8)
 * @route   POST /api/account/video-kyc
 * @access  Private
 */
exports.uploadVideoKYC = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload video KYC'
            });
        }

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete previous steps first'
            });
        }

        account.videoKYCPath = req.file.path;
        account.completionSteps.videoKYC = true;

        await account.save();

        res.status(200).json({
            success: true,
            message: 'Video KYC uploaded successfully',
            data: {
                videoKYCPath: account.videoKYCPath
            }
        });
    } catch (error) {
        console.error('Video KYC upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload video KYC',
            error: error.message
        });
    }
};

/**
 * @desc    Submit declaration (Step 9 - Final)
 * @route   POST /api/account/declaration
 * @access  Private
 */
exports.submitDeclaration = async (req, res) => {
    try {
        const userId = req.user._id;
        const { accepted, selectedFunds } = req.body;

        const account = await Account.findOne({ user: userId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Please complete previous steps first'
            });
        }

        account.declarationAccepted = accepted;
        account.declarationDate = new Date();
        account.declarationIP = req.ip;
        account.selectedFunds = selectedFunds;
        account.completionSteps.declaration = true;
        account.applicationStatus = 'submitted';

        await account.save();

        // Update user KYC status
        const user = await User.findById(userId);
        user.isKYCCompleted = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account opening application submitted successfully',
            data: {
                applicationStatus: account.applicationStatus,
                completionPercentage: account.completionPercentage
            }
        });
    } catch (error) {
        console.error('Declaration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit declaration',
            error: error.message
        });
    }
};

/**
 * @desc    Get account status
 * @route   GET /api/account/status
 * @access  Private
 */
exports.getAccountStatus = async (req, res) => {
    try {
        const userId = req.user._id;

        const account = await Account.findOne({ user: userId })
            .populate('selectedFunds', 'name code type');

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'No account application found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                applicationStatus: account.applicationStatus,
                completionSteps: account.completionSteps,
                completionPercentage: account.completionPercentage,
                reviewNotes: account.reviewNotes,
                rejectionReason: account.rejectionReason,
                selectedFunds: account.selectedFunds
            }
        });
    } catch (error) {
        console.error('Get account status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get account status',
            error: error.message
        });
    }
};

module.exports = exports;
