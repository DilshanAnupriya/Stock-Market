const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';

        // Determine upload path based on field name
        switch (file.fieldname) {
            case 'nicFront':
            case 'nicBack':
                uploadPath += 'nic/';
                break;
            case 'bankBook':
                uploadPath += 'bank-books/';
                break;
            case 'billingProof':
                uploadPath += 'billing-proofs/';
                break;
            case 'videoKYC':
                uploadPath += 'video-kyc/';
                break;
            case 'depositSlip':
                uploadPath += 'deposit-slips/';
                break;
            default:
                uploadPath += 'others/';
        }

        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: userId_timestamp_originalname
        const userId = req.user ? req.user._id : 'anonymous';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

        cb(null, `${userId}_${timestamp}_${sanitizedName}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedImageTypes = /jpeg|jpg|png|pdf/;
    const allowedVideoTypes = /mp4|avi|mov|wmv|webm/;

    const ext = path.extname(file.originalname).toLowerCase();
    const extname = ext.replace('.', '');

    // Check if it's a video field
    if (file.fieldname === 'videoKYC') {
        if (allowedVideoTypes.test(extname)) {
            return cb(null, true);
        } else {
            return cb(new Error('Only video files (mp4, avi, mov, wmv, webm) are allowed for Video KYC'));
        }
    }

    // For other fields, check image/PDF types
    if (allowedImageTypes.test(extname)) {
        return cb(null, true);
    } else {
        return cb(new Error('Only image files (jpeg, jpg, png) and PDF are allowed'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB for images/PDFs
    }
});

// Configure multer for video uploads
const uploadVideo = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB for videos
    }
});

// Middleware for different upload scenarios
const uploadMiddleware = {
    // Single file upload
    single: (fieldName) => upload.single(fieldName),

    // Multiple files upload
    multiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),

    // Multiple fields upload
    fields: (fields) => upload.fields(fields),

    // NIC upload (front and back)
    nicDocuments: upload.fields([
        { name: 'nicFront', maxCount: 1 },
        { name: 'nicBack', maxCount: 1 }
    ]),

    // Bank book upload
    bankBook: upload.single('bankBook'),

    // Billing proof upload
    billingProof: upload.single('billingProof'),

    // Video KYC upload
    videoKYC: uploadVideo.single('videoKYC'),

    // Deposit slip upload
    depositSlip: upload.single('depositSlip')
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 10MB for images/PDFs and 100MB for videos'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field in file upload'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next();
};

module.exports = {
    uploadMiddleware,
    handleMulterError
};
