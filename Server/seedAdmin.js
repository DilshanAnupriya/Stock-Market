const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./Models/User');

dotenv.config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Check if admin exists - search by email or role
        const existingAdmin = await User.findOne({
            $or: [
                { email: 'admin@stockmarket.com' },
                { role: 'admin' }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️ Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        const adminUser = new User({
            username: 'Super Admin',
            email: 'admin@stockmarket.com',
            password: 'adminpassword123', // Will be hashed by pre-save hook
            nic: '999999999V', // Dummy NIC
            mobile: '0777123456', // Dummy Mobile
            role: 'admin',
            accountType: 'individual',
            isEmailVerified: true,
            isMobileVerified: true,
            status: 'active'
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully');
        console.log('   Email: admin@stockmarket.com');
        console.log('   Password: adminpassword123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
