const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimit');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(apiLimiter);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No Content response
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Mentore Backend API',
    version: '1.0.0',
    documentation: {
      public_routes: {
        'POST /api/auth/signup': 'Create a new user account',
        'POST /api/auth/login': 'Authenticate user and get token'
      },
      protected_routes: {
        'GET /api/auth/me': 'Get current user profile (requires Authorization header)',
        'PUT /api/auth/me': 'Update user profile (requires Authorization header)',
        'POST /api/auth/assign-mentee': 'Assign mentee to mentor (mentors only)',
        'DELETE /api/auth/remove-mentee/:menteeId': 'Remove mentee from mentor (mentors only)'
      },
      authentication: 'Bearer <jwt-token> in Authorization header'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Mentore Backend Server Started!
📍 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📖 API Documentation: http://localhost:${PORT}/
🏥 Health Check: http://localhost:${PORT}/health

API Endpoints:
📝 POST /api/auth/signup - Create account
🔐 POST /api/auth/login - User login
👤 GET /api/auth/me - Get profile (protected)
✏️  PUT /api/auth/me - Update profile (protected)
👥 POST /api/auth/assign-mentee - Assign mentee (mentors only)
❌ DELETE /api/auth/remove-mentee/:id - Remove mentee (mentors only)
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

module.exports = app;