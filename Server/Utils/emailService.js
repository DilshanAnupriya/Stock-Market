/**
 * Email Service - Placeholder for future email provider integration
 * Can be configured with SendGrid, AWS SES, or SMTP
 */

class EmailService {
    /**
     * Send OTP via email
     */
    static async sendOTP(email, otpCode, purpose) {
        try {
            // TODO: Integrate with email service provider (SendGrid, AWS SES, etc.)

            console.log('='.repeat(50));
            console.log('📧 EMAIL OTP (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${email}`);
            console.log(`Purpose: ${purpose}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log(`Expires: ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString()}`);
            console.log('='.repeat(50));

            // Simulate email sending
            return {
                success: true,
                messageId: `email-${Date.now()}`,
                message: 'OTP sent successfully (simulated)'
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send welcome email
     */
    static async sendWelcomeEmail(email, username) {
        try {
            console.log('='.repeat(50));
            console.log('📧 WELCOME EMAIL (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${email}`);
            console.log(`Username: ${username}`);
            console.log('Message: Welcome to Stock Market Platform!');
            console.log('='.repeat(50));

            return {
                success: true,
                messageId: `email-${Date.now()}`,
                message: 'Welcome email sent successfully (simulated)'
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send transaction notification
     */
    static async sendTransactionNotification(email, transactionDetails) {
        try {
            console.log('='.repeat(50));
            console.log('📧 TRANSACTION EMAIL (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${email}`);
            console.log(`Type: ${transactionDetails.type}`);
            console.log(`Amount: LKR ${transactionDetails.amount}`);
            console.log(`Status: ${transactionDetails.status}`);
            console.log('='.repeat(50));

            return {
                success: true,
                messageId: `email-${Date.now()}`,
                message: 'Transaction email sent successfully (simulated)'
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send password reset email
     */
    static async sendPasswordResetEmail(email, resetToken) {
        try {
            const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

            console.log('='.repeat(50));
            console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${email}`);
            console.log(`Reset Link: ${resetLink}`);
            console.log('='.repeat(50));

            return {
                success: true,
                messageId: `email-${Date.now()}`,
                message: 'Password reset email sent successfully (simulated)'
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Send account verification email
     */
    static async sendAccountVerificationEmail(email, verificationLink) {
        try {
            console.log('='.repeat(50));
            console.log('📧 ACCOUNT VERIFICATION EMAIL (Development Mode)');
            console.log('='.repeat(50));
            console.log(`To: ${email}`);
            console.log(`Verification Link: ${verificationLink}`);
            console.log('='.repeat(50));

            return {
                success: true,
                messageId: `email-${Date.now()}`,
                message: 'Verification email sent successfully (simulated)'
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = EmailService;
