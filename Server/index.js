const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Database Connection (MongoDB)
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-market';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Connect to Database
connectDB();

// Import Routes
const authRoutes = require('./Routes/authRoutes');
const accountRoutes = require('./Routes/accountRoutes');
const transactionRoutes = require('./Routes/transactionRoutes');
const fundRoutes = require('./Routes/fundRoutes');
const adminRoutes = require('./Routes/adminRoutes');

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// API Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Stock Market API Server',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            account: '/api/account',
            transactions: '/api/transaction',
            funds: '/api/funds',
            admin: '/api/admin'
        }
    });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        path: req.path
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Server Configuration
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`\n✨ Stock Market Server Ready!\n`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;
