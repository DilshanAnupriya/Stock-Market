const express = require('express');
const router = express.Router();
const transactionController = require('../Controllers/transactionController');
const { protect, canTransact } = require('../Middleware/authMiddleware');
const { uploadMiddleware, handleMulterError } = require('../Middleware/uploadMiddleware');
const { validate, schemas } = require('../Middleware/validationMiddleware');

// All routes are protected and require KYC completion
router.use(protect);
router.use(canTransact);

// Deposit Routes
router.post(
    '/deposit',
    validate(schemas.deposit),
    transactionController.depositMoney
);

router.post(
    '/deposit/verify',
    transactionController.verifyDeposit
);

router.post(
    '/deposit/upload-slip',
    uploadMiddleware.depositSlip,
    handleMulterError,
    transactionController.uploadDepositSlip
);

// Withdrawal Routes
router.post(
    '/withdraw',
    validate(schemas.withdrawal),
    transactionController.withdrawMoney
);

router.post(
    '/withdraw/verify',
    transactionController.verifyWithdrawal
);

// Transaction History
router.get('/history', transactionController.getTransactionHistory);

// Balance
router.get('/balance', transactionController.getBalance);

module.exports = router;
