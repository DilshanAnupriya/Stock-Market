const express = require('express');
const router = express.Router();
const fundController = require('../Controllers/fundController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// Public routes
router.get('/', fundController.getAllFunds);
router.get('/:id', fundController.getFundDetails);

// Protected routes
router.get('/my-investments', protect, fundController.getUserInvestments);

// Admin routes
router.post('/', protect, authorize('admin'), fundController.createFund);
router.put('/:id', protect, authorize('admin'), fundController.updateFund);

module.exports = router;
