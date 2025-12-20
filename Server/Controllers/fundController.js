const Fund = require('../Models/Fund');

/**
 * @desc    Get all available funds
 * @route   GET /api/funds
 * @access  Public
 */
exports.getAllFunds = async (req, res) => {
    try {
        const { type, isActive = true } = req.query;

        const query = { isActive };
        if (type) query.type = type;

        const funds = await Fund.find(query).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: funds.length,
            data: funds
        });
    } catch (error) {
        console.error('Get funds error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get funds',
            error: error.message
        });
    }
};

/**
 * @desc    Get fund details by ID
 * @route   GET /api/funds/:id
 * @access  Public
 */
exports.getFundDetails = async (req, res) => {
    try {
        const fund = await Fund.findById(req.params.id);

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        res.status(200).json({
            success: true,
            data: fund
        });
    } catch (error) {
        console.error('Get fund details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fund details',
            error: error.message
        });
    }
};

/**
 * @desc    Get user's investments
 * @route   GET /api/funds/my-investments
 * @access  Private
 */
exports.getUserInvestments = async (req, res) => {
    try {
        const userId = req.user._id;

        // TODO: Implement proper investment tracking
        // This requires a Portfolio model or aggregating from transactions

        res.status(200).json({
            success: true,
            message: 'Investment tracking not yet implemented',
            data: {
                totalInvestment: 0,
                investments: []
            }
        });
    } catch (error) {
        console.error('Get user investments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user investments',
            error: error.message
        });
    }
};

/**
 * @desc    Create new fund (Admin only - placeholder)
 * @route   POST /api/funds
 * @access  Private/Admin
 */
exports.createFund = async (req, res) => {
    try {
        const fundData = req.body;

        const fund = await Fund.create(fundData);

        res.status(201).json({
            success: true,
            message: 'Fund created successfully',
            data: fund
        });
    } catch (error) {
        console.error('Create fund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create fund',
            error: error.message
        });
    }
};

/**
 * @desc    Update fund (Admin only - placeholder)
 * @route   PUT /api/funds/:id
 * @access  Private/Admin
 */
exports.updateFund = async (req, res) => {
    try {
        const fund = await Fund.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fund updated successfully',
            data: fund
        });
    } catch (error) {
        console.error('Update fund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update fund',
            error: error.message
        });
    }
};

module.exports = exports;
