const Transaction = require('../Models/Transaction');
const Fund = require('../Models/Fund');
const OTPService = require('../Utils/otpService');
const EmailService = require('../Utils/emailService');
const SMSService = require('../Utils/smsService');

/**
 * @desc    Initiate deposit
 * @route   POST /api/transaction/deposit
 * @access  Private (requires KYC)
 */
exports.depositMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fundId, amount, remarks } = req.body;

        // Verify fund exists
        const fund = await Fund.findById(fundId);
        if (!fund || !fund.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found or inactive'
            });
        }

        // Check minimum investment
        if (amount < fund.minimumInvestment) {
            return res.status(400).json({
                success: false,
                message: `Minimum investment for ${fund.name} is LKR ${fund.minimumInvestment}`
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            user: userId,
            type: 'deposit',
            fund: fundId,
            amount,
            remarks,
            status: 'pending',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            deviceType: req.get('user-agent')?.includes('Mobile') ? 'mobile' : 'web'
        });

        // Generate OTP
        const otp = await OTPService.createOTP(
            userId,
            'transaction',
            req.user.email,
            'both',
            transaction._id
        );

        // Send OTP
        await EmailService.sendOTP(req.user.email, otp.otpCode, 'transaction');
        await SMSService.sendOTP(req.user.mobile, otp.otpCode, 'transaction');

        // Update transaction status
        transaction.status = 'otp-sent';
        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Deposit initiated. Please verify with OTP sent to your email and mobile.',
            data: {
                transactionId: transaction._id,
                otpId: otp.otpId,
                amount: transaction.amount,
                fund: fund.name
            }
        });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate deposit',
            error: error.message
        });
    }
};

/**
 * @desc    Verify and complete deposit
 * @route   POST /api/transaction/deposit/verify
 * @access  Private
 */
exports.verifyDeposit = async (req, res) => {
    try {
        const userId = req.user._id;
        const { transactionId, otpId, otpCode } = req.body;

        // Verify OTP
        const otpResult = await OTPService.verifyOTP(otpId, otpCode, userId);

        if (!otpResult.success) {
            return res.status(400).json(otpResult);
        }

        // Get transaction
        const transaction = await Transaction.findOne({
            _id: transactionId,
            user: userId
        }).populate('fund', 'name code');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Update transaction
        transaction.otpVerified = true;
        transaction.otpVerifiedAt = new Date();
        transaction.status = 'verified';
        await transaction.save();

        // Send notifications
        await EmailService.sendTransactionNotification(req.user.email, {
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            fund: transaction.fund.name
        });

        await SMSService.sendTransactionAlert(req.user.mobile, {
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status
        });

        res.status(200).json({
            success: true,
            message: 'Deposit verified successfully. Please upload deposit slip to complete.',
            data: transaction
        });
    } catch (error) {
        console.error('Verify deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify deposit',
            error: error.message
        });
    }
};

/**
 * @desc    Upload deposit slip
 * @route   POST /api/transaction/deposit/upload-slip
 * @access  Private
 */
exports.uploadDepositSlip = async (req, res) => {
    try {
        const userId = req.user._id;
        const { transactionId } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload deposit slip'
            });
        }

        const transaction = await Transaction.findOne({
            _id: transactionId,
            user: userId
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        transaction.proofDocument = req.file.path;
        transaction.status = 'processing';
        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Deposit slip uploaded successfully. Your deposit is being processed.',
            data: transaction
        });
    } catch (error) {
        console.error('Upload deposit slip error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload deposit slip',
            error: error.message
        });
    }
};

/**
 * @desc    Initiate withdrawal
 * @route   POST /api/transaction/withdraw
 * @access  Private (requires KYC)
 */
exports.withdrawMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fundId, amount, remarks, withdrawalBankDetails } = req.body;

        // Verify fund exists
        const fund = await Fund.findById(fundId);
        if (!fund || !fund.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found or inactive'
            });
        }

        // Check minimum withdrawal
        if (amount < fund.minimumWithdrawal) {
            return res.status(400).json({
                success: false,
                message: `Minimum withdrawal for ${fund.name} is LKR ${fund.minimumWithdrawal}`
            });
        }

        // TODO: Check user balance (requires portfolio/balance tracking)

        // Create transaction
        const transaction = await Transaction.create({
            user: userId,
            type: 'withdrawal',
            fund: fundId,
            amount,
            remarks,
            withdrawalBankDetails,
            status: 'pending',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            deviceType: req.get('user-agent')?.includes('Mobile') ? 'mobile' : 'web'
        });

        // Generate OTP
        const otp = await OTPService.createOTP(
            userId,
            'transaction',
            req.user.email,
            'both',
            transaction._id
        );

        // Send OTP
        await EmailService.sendOTP(req.user.email, otp.otpCode, 'transaction');
        await SMSService.sendOTP(req.user.mobile, otp.otpCode, 'transaction');

        // Update transaction status
        transaction.status = 'otp-sent';
        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Withdrawal initiated. Please verify with OTP sent to your email and mobile.',
            data: {
                transactionId: transaction._id,
                otpId: otp.otpId,
                amount: transaction.amount,
                fund: fund.name
            }
        });
    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate withdrawal',
            error: error.message
        });
    }
};

/**
 * @desc    Verify and complete withdrawal
 * @route   POST /api/transaction/withdraw/verify
 * @access  Private
 */
exports.verifyWithdrawal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { transactionId, otpId, otpCode } = req.body;

        // Verify OTP
        const otpResult = await OTPService.verifyOTP(otpId, otpCode, userId);

        if (!otpResult.success) {
            return res.status(400).json(otpResult);
        }

        // Get transaction
        const transaction = await Transaction.findOne({
            _id: transactionId,
            user: userId
        }).populate('fund', 'name code');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Update transaction
        transaction.otpVerified = true;
        transaction.otpVerifiedAt = new Date();
        transaction.status = 'processing';
        await transaction.save();

        // Send notifications
        await EmailService.sendTransactionNotification(req.user.email, {
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            fund: transaction.fund.name
        });

        await SMSService.sendTransactionAlert(req.user.mobile, {
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal verified successfully. Your request is being processed.',
            data: transaction
        });
    } catch (error) {
        console.error('Verify withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify withdrawal',
            error: error.message
        });
    }
};

/**
 * @desc    Get transaction history
 * @route   GET /api/transaction/history
 * @access  Private
 */
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, type, status } = req.query;

        const query = { user: userId };
        if (type) query.type = type;
        if (status) query.status = status;

        const transactions = await Transaction.find(query)
            .populate('fund', 'name code type')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transaction history',
            error: error.message
        });
    }
};

/**
 * @desc    Get balance by fund
 * @route   GET /api/transaction/balance
 * @access  Private
 */
exports.getBalance = async (req, res) => {
    try {
        const userId = req.user._id;

        // TODO: Implement proper balance calculation
        // This is a placeholder - you'll need to implement portfolio tracking

        res.status(200).json({
            success: true,
            message: 'Balance calculation not yet implemented',
            data: {
                totalBalance: 0,
                funds: []
            }
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get balance',
            error: error.message
        });
    }
};

module.exports = exports;
