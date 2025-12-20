const express = require('express');
const router = express.Router();
const accountController = require('../Controllers/accountController');
const { protect } = require('../Middleware/authMiddleware');
const { uploadMiddleware, handleMulterError } = require('../Middleware/uploadMiddleware');
const { validate, schemas } = require('../Middleware/validationMiddleware');

// All routes are protected
router.use(protect);

// Step 1: Personal Details
router.post(
    '/personal-details',
    validate(schemas.personalDetails),
    accountController.submitPersonalDetails
);

// Step 2: NIC Upload
router.post(
    '/upload-nic',
    uploadMiddleware.nicDocuments,
    handleMulterError,
    accountController.uploadNIC
);

// Step 3: Bank Details
router.post(
    '/bank-details',
    validate(schemas.bankDetails),
    accountController.submitBankDetails
);

// Step 4: Bank Book Upload
router.post(
    '/upload-bank-book',
    uploadMiddleware.bankBook,
    handleMulterError,
    accountController.uploadBankBook
);

// Step 5: Billing Proof Upload
router.post(
    '/upload-billing-proof',
    uploadMiddleware.billingProof,
    handleMulterError,
    accountController.uploadBillingProof
);

// Step 6: Employment Details
router.post(
    '/employment-details',
    validate(schemas.employmentDetails),
    accountController.submitEmploymentDetails
);

// Step 7: Nominee Details
router.post(
    '/nominee',
    validate(schemas.nominee),
    accountController.addNominee
);

// Step 8: Video KYC Upload
router.post(
    '/video-kyc',
    uploadMiddleware.videoKYC,
    handleMulterError,
    accountController.uploadVideoKYC
);

// Step 9: Declaration (Final Step)
router.post(
    '/declaration',
    validate(schemas.declaration),
    accountController.submitDeclaration
);

// Get Account Status
router.get('/status', accountController.getAccountStatus);

module.exports = router;
