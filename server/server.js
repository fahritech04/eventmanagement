require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { startDeadlineChecker } = require('./services/deadlineChecker');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/deadlines', require('./routes/deadlineRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'EventPro API' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 EventPro API Server berjalan di port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}/api/health\n`);

  // Start deadline checker cron job
  startDeadlineChecker();
});
