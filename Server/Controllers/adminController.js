const User = require('../Models/User');
const Account = require('../Models/Account');
const Transaction = require('../Models/Transaction');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, status, search } = req.query;

        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { nic: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

/**
 * @desc    Get user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's account/KYC data
        const account = await Account.findOne({ user: user._id })
            .populate('selectedFunds', 'name code type');

        res.status(200).json({
            success: true,
            data: {
                user,
                account
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user details',
            error: error.message
        });
    }
};

/**
 * @desc    Update user status
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'suspended', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User status updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};

/**
 * @desc    Get pending KYC applications
 * @route   GET /api/admin/kyc/pending
 * @access  Private/Admin
 */
exports.getPendingKYC = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const accounts = await Account.find({
            applicationStatus: { $in: ['submitted', 'under-review'] }
        })
            .populate('user', 'nic email mobile username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Account.countDocuments({
            applicationStatus: { $in: ['submitted', 'under-review'] }
        });

        res.status(200).json({
            success: true,
            data: accounts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get pending KYC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get pending KYC applications',
            error: error.message
        });
    }
};

/**
 * @desc    Get KYC application details by Account ID
 * @route   GET /api/admin/kyc/:id
 * @access  Private/Admin
 */
exports.getKYCDetails = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id)
            .populate('user', 'nic email mobile username')
            .populate('bankDetails');

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'KYC application not found'
            });
        }

        res.status(200).json({
            success: true,
            data: account
        });
    } catch (error) {
        console.error('Get KYC details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC details',
            error: error.message
        });
    }
};

/**
 * @desc    Review KYC application
 * @route   PUT /api/admin/kyc/:id/review
 * @access  Private/Admin
 */
exports.reviewKYC = async (req, res) => {
    try {
        const { action, reviewNotes, rejectionReason } = req.body;

        if (!['approve', 'reject', 'request-changes'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be approve, reject, or request-changes'
            });
        }

        const account = await Account.findById(req.params.id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account application not found'
            });
        }

        // Update account based on action
        if (action === 'approve') {
            account.applicationStatus = 'approved';
            account.nicVerified = true;
            account.videoKYCVerified = true;

            // Update user KYC status
            await User.findByIdAndUpdate(account.user, {
                isKYCCompleted: true
            });
        } else if (action === 'reject') {
            account.applicationStatus = 'rejected';
            account.rejectionReason = rejectionReason;
        } else if (action === 'request-changes') {
            account.applicationStatus = 'under-review';
        }

        account.reviewedBy = req.user._id;
        account.reviewedAt = new Date();
        account.reviewNotes = reviewNotes;

        await account.save();

        res.status(200).json({
            success: true,
            message: `KYC application ${action}d successfully`,
            data: account
        });
    } catch (error) {
        console.error('Review KYC error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review KYC application',
            error: error.message
        });
    }
};

/**
 * @desc    Get all transactions (admin view)
 * @route   GET /api/admin/transactions
 * @access  Private/Admin
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status, userId } = req.query;

        const query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (userId) query.user = userId;

        const transactions = await Transaction.find(query)
            .populate('user', 'nic email mobile username')
            .populate('fund', 'name code type')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions',
            error: error.message
        });
    }
};

/**
 * @desc    Process transaction (approve/reject)
 * @route   PUT /api/admin/transactions/:id/process
 * @access  Private/Admin
 */
exports.processTransaction = async (req, res) => {
    try {
        const { action, processingNotes, failureReason } = req.body;

        if (!['complete', 'fail'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be complete or fail'
            });
        }

        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (action === 'complete') {
            transaction.status = 'completed';
            // TODO: Update user balance/portfolio
        } else if (action === 'fail') {
            transaction.status = 'failed';
            transaction.failureReason = failureReason;
        }

        transaction.processedBy = req.user._id;
        transaction.processedAt = new Date();
        transaction.processingNotes = processingNotes;

        await transaction.save();

        res.status(200).json({
            success: true,
            message: `Transaction ${action}d successfully`,
            data: transaction
        });
    } catch (error) {
        console.error('Process transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process transaction',
            error: error.message
        });
    }
};

/**
 * @desc    Create a new user (admin only)
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, mobile, nic, role } = req.body;

        // Basic validation
        if (!username || !email || !password || !mobile || !nic || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email }, { nic }, { mobile }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists (Email, NIC, or Mobile)'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            mobile,
            nic,
            role,
            isVerified: true // Auto-verify email/mobile since admin created it? Or leave false?
            // Let's assume admin created users are considered verified for login purposes, 
            // OR they still need to verify OTP.
            // For simplicity, let's keep isVerified default (false) or set to true if admin trusts them.
            // The request didn't specify, but usually admin-created users might skip OTP.
            // However, the schema defaults might be in place. 
            // Let's stick to default behavior (false) unless specified, but for "admin" creating "admin", 
            // maybe we want them active immediately. 
            // Let's set isVerified: true for convenience as it's an admin action.
        });

        // If we want to set isVerified: true, we should include it. 
        // Based on typical "Admin creates user" flows, they are pre-verified.
        user.isVerified = true;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const pendingKYC = await Account.countDocuments({
            applicationStatus: { $in: ['submitted', 'under-review'] }
        });
        const approvedKYC = await Account.countDocuments({ applicationStatus: 'approved' });

        const pendingTransactions = await Transaction.countDocuments({
            status: { $in: ['pending', 'otp-sent', 'verified', 'processing'] }
        });
        const completedTransactions = await Transaction.countDocuments({ status: 'completed' });

        // Aggregate transaction amounts
        const depositStats = await Transaction.aggregate([
            { $match: { type: 'deposit', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const withdrawalStats = await Transaction.aggregate([
            { $match: { type: 'withdrawal', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    suspended: await User.countDocuments({ status: 'suspended' })
                },
                kyc: {
                    pending: pendingKYC,
                    approved: approvedKYC,
                    rejected: await Account.countDocuments({ applicationStatus: 'rejected' })
                },
                transactions: {
                    pending: pendingTransactions,
                    completed: completedTransactions,
                    failed: await Transaction.countDocuments({ status: 'failed' })
                },
                deposits: {
                    total: depositStats[0]?.total || 0,
                    count: depositStats[0]?.count || 0
                },
                withdrawals: {
                    total: withdrawalStats[0]?.total || 0,
                    count: withdrawalStats[0]?.count || 0
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard statistics',
            error: error.message
        });
    }
};

module.exports = exports;
