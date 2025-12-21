const OTP = require('../Models/OTP');

class OTPService {
    /**
     * Generate a random 6-digit OTP
     */
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Create and save OTP to database
     */
    static async createOTP(userId, purpose, sentTo, sentVia, transactionId = null) {
        try {
            const otpCode = this.generateOTP();
            const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

            const otp = new OTP({
                user: userId,
                otpHash: otpCode, // Will be hashed by pre-save hook
                purpose,
                sentTo,
                sentVia,
                expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
                ...(transactionId && { transaction: transactionId })
            });

            await otp.save();

            return {
                otpId: otp._id,
                otpCode, // Return plain OTP for sending
                expiresAt: otp.expiresAt
            };
        } catch (error) {
            throw new Error(`Failed to create OTP: ${error.message}`);
        }
    }

    /**
     * Verify OTP
     */
    static async verifyOTP(otpId, otpCode, userId) {
        try {
            const otp = await OTP.findOne({
                _id: otpId,
                user: userId,
                isVerified: false
            });

            if (!otp) {
                return { success: false, message: 'Invalid OTP or OTP already used' };
            }

            // Check if expired
            if (otp.isExpired()) {
                return { success: false, message: 'OTP has expired' };
            }

            // Check max attempts
            if (otp.maxAttemptsReached()) {
                return { success: false, message: 'Maximum verification attempts reached' };
            }

            // Increment attempts
            otp.attempts += 1;

            // Compare OTP
            const isMatch = await otp.compareOTP(otpCode);

            if (!isMatch) {
                await otp.save();
                const remainingAttempts = otp.maxAttempts - otp.attempts;
                return {
                    success: false,
                    message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining`
                };
            }

            // Mark as verified
            otp.isVerified = true;
            otp.verifiedAt = new Date();
            await otp.save();

            return {
                success: true,
                message: 'OTP verified successfully',
                otp
            };
        } catch (error) {
            throw new Error(`Failed to verify OTP: ${error.message}`);
        }
    }

    /**
     * Resend OTP (invalidate old and create new)
     */
    static async resendOTP(userId, purpose, sentTo, sentVia) {
        try {
            // Check rate limiting - allow resend only after 1 minute
            const recentOTP = await OTP.findOne({
                user: userId,
                purpose,
                createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
            });

            if (recentOTP) {
                return {
                    success: false,
                    message: 'Please wait 1 minute before requesting a new OTP'
                };
            }

            // Invalidate all previous OTPs for this purpose
            await OTP.updateMany(
                { user: userId, purpose, isVerified: false },
                { isVerified: true } // Mark as verified to prevent use
            );

            // Create new OTP
            const result = await this.createOTP(userId, purpose, sentTo, sentVia);

            return {
                success: true,
                ...result
            };
        } catch (error) {
            throw new Error(`Failed to resend OTP: ${error.message}`);
        }
    }

    /**
     * Clean up expired OTPs (can be called by a cron job)
     */
    static async cleanupExpiredOTPs() {
        try {
            const result = await OTP.deleteMany({
                expiresAt: { $lt: new Date() },
                isVerified: false
            });

            return {
                success: true,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            throw new Error(`Failed to cleanup OTPs: ${error.message}`);
        }
    }
}

module.exports = OTPService;
