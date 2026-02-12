const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const bookingRoutes = require('./routes/booking.routes');
const roomRoutes = require('./routes/room.routes');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const housekeepingRoutes = require('./routes/housekeeping.routes');
const maintenanceRoutes = require('./routes/maintenance.routes'); 
const servicesRoutes = require('./routes/services.routes');
const serviceOrdersRoutes = require('./routes/serviceOrders.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const emailRoutes = require('./routes/email.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'LuxuryStay Hotel Management System API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'operational'
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes); 
app.use('/api/payments', paymentRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-orders', serviceOrdersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;