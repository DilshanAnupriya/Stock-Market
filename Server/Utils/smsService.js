/**
 * SMS Service - Placeholder for future SMS provider integration
 * Can be configured with Twilio, AWS SNS, or local SMS gateway
 */

class SMSService {
    /**
     * Send OTP via SMS
     */
    static async sendOTP(mobile, otpCode, purpose) {
        try {
            // TODO: Integrate with SMS service provider (Twilio, AWS SNS, etc.)

            console.log('='.repeat(50));
            console.log('📱 SMS OTP (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${mobile}`);
            console.log(`Purpose: ${purpose}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log(`Message: Your OTP is ${otpCode}. Valid for 10 minutes. Do not share with anyone.`);
            console.log('='.repeat(50));

            // Simulate SMS sending
            return {
                success: true,
                messageId: `sms-${Date.now()}`,
                message: 'OTP sent successfully (simulated)'
            };
        } catch (error) {
            console.error('SMS sending failed:', error);
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }

    /**
     * Send transaction alert via SMS
     */
    static async sendTransactionAlert(mobile, transactionDetails) {
        try {
            const message = `Transaction Alert: ${transactionDetails.type.toUpperCase()} of LKR ${transactionDetails.amount} ${transactionDetails.status}. Ref: ${transactionDetails.reference || 'N/A'}`;

            console.log('='.repeat(50));
            console.log('📱 TRANSACTION SMS (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${mobile}`);
            console.log(`Message: ${message}`);
            console.log('='.repeat(50));

            return {
                success: true,
                messageId: `sms-${Date.now()}`,
                message: 'Transaction SMS sent successfully (simulated)'
            };
        } catch (error) {
            console.error('SMS sending failed:', error);
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }

    /**
     * Send account verification SMS
     */
    static async sendVerificationSMS(mobile, verificationCode) {
        try {
            const message = `Your verification code is ${verificationCode}. Valid for 10 minutes.`;

            console.log('='.repeat(50));
            console.log('📱 VERIFICATION SMS (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${mobile}`);
            console.log(`Message: ${message}`);
            console.log('='.repeat(50));

            return {
                success: true,
                messageId: `sms-${Date.now()}`,
                message: 'Verification SMS sent successfully (simulated)'
            };
        } catch (error) {
            console.error('SMS sending failed:', error);
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }

    /**
     * Send welcome SMS
     */
    static async sendWelcomeSMS(mobile, username) {
        try {
            const message = `Welcome ${username}! Your Stock Market account has been created successfully. Start investing today!`;

            console.log('='.repeat(50));
            console.log('📱 WELCOME SMS (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${mobile}`);
            console.log(`Message: ${message}`);
            console.log('='.repeat(50));

            return {
                success: true,
                messageId: `sms-${Date.now()}`,
                message: 'Welcome SMS sent successfully (simulated)'
            };
        } catch (error) {
            console.error('SMS sending failed:', error);
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }
}

module.exports = SMSService;
