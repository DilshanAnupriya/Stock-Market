const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const { protect, authorize } = require('../Middleware/authMiddleware');

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);

// KYC Management
router.get('/kyc/pending', adminController.getPendingKYC);
router.get('/kyc/:id', adminController.getKYCDetails); // New route
router.put('/kyc/:id/review', adminController.reviewKYC);

// Transaction Management
router.get('/transactions', adminController.getAllTransactions);
router.put('/transactions/:id/process', adminController.processTransaction);

// Dashboard Statistics
router.get('/stats', adminController.getDashboardStats);

module.exports = router;
