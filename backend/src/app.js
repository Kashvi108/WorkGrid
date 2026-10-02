const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' }); // ✅ Explicit path
const compression = require('compression');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // ✅ Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 100 requests per window
  skip: (req) => req.method === 'OPTIONS',
  message: {
    message: 'Too many requests, please try again later.'
  }
});

app.use('/api/', limiter);

// ✅ Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});
app.use('/api/auth/login', authLimiter);

console.log('🔍 MONGO_URI:', process.env.MONGO_URI);

// routes->

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');



app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);



app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('❌ ERROR STACK:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// ============================================
// CONNECT TO MONGODB
// ============================================

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

module.exports = app;