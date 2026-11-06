const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. Narrowly configured CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl/mobile requests without origin
    if (!origin) return callback(null, true);
    // Allow any localhost/127.0.0.1 port in local development or configured frontendUrl
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || origin === config.frontendUrl) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Request body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins
  message: {
    status: 'fail',
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 4. API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MediConnect API',
    version: '1.0.0'
  });
});

// 5. Catch-all for unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server.`, 404));
});

// 6. Central error handler
app.use(errorHandler);

module.exports = app;
