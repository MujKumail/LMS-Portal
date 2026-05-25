const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { sanitizeInput } = require('./middleware/sanitize');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const progressRoutes = require('./routes/progressRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with permissive origin for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Apply custom XSS sanitization recursive middleware on all input streams
app.use(sanitizeInput);

// Apply Rate Limiting to prevent brute-force attacks on Auth & Support channels
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again in 15 minutes.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 tickets per hour
  message: { error: 'Support ticket limit exceeded. Please try again later.' }
});

app.use('/api/auth', authLimiter);
app.use('/api/contact', contactLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);

// Root verification route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LMS RESTful API service is running normally.',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error-handling Middleware with full logging
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const reqContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body ? JSON.stringify(req.body) : 'None'
  };

  console.error(`❌  [Backend Failure - ${timestamp}] ${err.stack || err.message}`);
  console.error(`Context:`, reqContext);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error. Please contact support.',
    timestamp
  });
});

// Initialize database & startup server
const startServer = async () => {
  const dbConnected = await connectDB();
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`🚀 [Server] LMS REST API Backend listening on port ${PORT} (Node Env: ${process.env.NODE_ENV})`);
    });
  } else {
    console.error('❌  [Server] Database connection failed. Aborting startup.');
    process.exit(1);
  }
};

startServer();
