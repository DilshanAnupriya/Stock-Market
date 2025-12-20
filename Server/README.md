# Stock Market Backend API

A comprehensive RESTful API backend for a Stock Market application supporting account opening, KYC verification, deposits, withdrawals, and investment product management for both mobile and web platforms.

## Features

- ✅ **User Authentication** - JWT-based authentication with OTP verification
- ✅ **Account Opening** - 9-step KYC process with document uploads
- ✅ **Deposit & Withdrawal** - Secure transactions with OTP verification
- ✅ **Investment Products** - Fund management and portfolio tracking
- ✅ **File Upload** - Document management for NIC, bank books, billing proofs, and video KYC
- ✅ **Multi-platform Support** - Works with both web and mobile clients
- ✅ **Security** - Helmet, rate limiting, CORS, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **File Upload**: Multer
- **Security**: Helmet, express-rate-limit, CORS

## Installation

1. **Clone the repository**
```bash
cd Server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env
```

5. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /verify-otp` - Verify OTP
- `POST /resend-otp` - Resend OTP
- `GET /me` - Get current user
- `POST /logout` - Logout user

### Account Opening (`/api/account`)
- `POST /personal-details` - Submit personal details
- `POST /upload-nic` - Upload NIC documents
- `POST /bank-details` - Submit bank details
- `POST /upload-bank-book` - Upload bank book
- `POST /upload-billing-proof` - Upload billing proof
- `POST /employment-details` - Submit employment details
- `POST /nominee` - Add nominees
- `POST /video-kyc` - Upload video KYC
- `POST /declaration` - Submit final declaration
- `GET /status` - Get account status

### Transactions (`/api/transaction`)
- `POST /deposit` - Initiate deposit
- `POST /deposit/verify` - Verify deposit with OTP
- `POST /deposit/upload-slip` - Upload deposit slip
- `POST /withdraw` - Initiate withdrawal
- `POST /withdraw/verify` - Verify withdrawal with OTP
- `GET /history` - Get transaction history
- `GET /balance` - Get account balance

### Funds (`/api/funds`)
- `GET /` - Get all funds
- `GET /:id` - Get fund details
- `GET /my-investments` - Get user investments
- `POST /` - Create fund (Admin)
- `PUT /:id` - Update fund (Admin)

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS
- `OTP_EXPIRY_MINUTES` - OTP expiry time (default: 10)

## Project Structure

```
Server/
├── Controllers/        # Business logic
│   ├── authController.js
│   ├── accountController.js
│   ├── transactionController.js
│   └── fundController.js
├── Models/            # Database schemas
│   ├── User.js
│   ├── Account.js
│   ├── Transaction.js
│   ├── Fund.js
│   └── OTP.js
├── Routes/            # API routes
│   ├── authRoutes.js
│   ├── accountRoutes.js
│   ├── transactionRoutes.js
│   └── fundRoutes.js
├── Middleware/        # Custom middleware
│   ├── authMiddleware.js
│   ├── uploadMiddleware.js
│   └── validationMiddleware.js
├── Utils/             # Utility services
│   ├── otpService.js
│   ├── emailService.js
│   └── smsService.js
├── uploads/           # Uploaded files
├── index.js           # Main application file
├── package.json
└── .env.example
```

## Development Notes

### OTP & Notifications
Currently, OTP codes and notifications are logged to the console in development mode. To enable actual email/SMS delivery:

1. **Email**: Configure one of:
   - SendGrid (recommended)
   - AWS SES
   - SMTP server

2. **SMS**: Configure one of:
   - Twilio (recommended)
   - AWS SNS
   - Local SMS gateway

Update the respective service files in `Utils/` folder.

### Video KYC
The current implementation supports video file uploads. For live video KYC:
- Integrate with Zoom, Agora, or WebRTC
- Update `accountController.js` accordingly

### File Storage
Files are currently stored locally in the `uploads/` directory. For production:
- Consider using AWS S3, Google Cloud Storage, or similar
- Update `uploadMiddleware.js` for cloud storage integration

## Security Considerations

- Change `JWT_SECRET` in production
- Enable HTTPS in production
- Configure proper CORS origins
- Set up rate limiting per your needs
- Implement admin role-based access control
- Add request logging and monitoring
- Regular security audits

## Testing

```bash
# Check server health
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nic": "123456789V",
    "mobile": "0771234567",
    "email": "test@example.com",
    "password": "Test@123",
    "accountType": "individual"
  }'
```

## License

ISC

## Support

For issues and questions, please contact the development team.
