/**
 * Export Controller
 * Handles export requests, queues jobs, and serves downloads
 */

const ExportJob = require('../models/ExportJob');
const exportQueue = require('../services/exportQueue');
const exportHelper = require('../utils/exportHelper');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');

const LARGE_EXPORT_THRESHOLD = 1000;

// Create and enqueue job helper
async function _createAndEnqueue(user, exportType, format, filters = {}, options = {}, priority = 'normal') {
  // Validate user exists and has ID
  if (!user || !user._id) {
    const err = new Error('User authentication required');
    err.statusCode = 401;
    throw err;
  }

  // Log user ID for debugging
  console.log('Creating job for user:', user._id);

  // validate export request
  const validation = exportHelper.validateExportRequest(user, exportType, filters);
  if (!validation.valid) {
    const err = new Error(validation.message || 'Invalid export request');
    err.statusCode = 400;
    throw err;
  }

  // Create job
  const job = await ExportJob.createJob(user._id, exportType, format, filters, options);
  console.log('Job created:', job.jobId);

  // store filters/options in job (already done in createJob but ensure saved)
  await ExportJob.findOneAndUpdate({ jobId: job.jobId }, { filters, options }, { new: true });

  // Adjust priority for large exports
  if (options.data && Array.isArray(options.data) && options.data.length > LARGE_EXPORT_THRESHOLD) {
    priority = 'low';
  }

  // Add to queue
  await exportQueue.addToQueue(job.jobId, exportType, format, filters, options, priority);

  return job.jobId;
}

// 1. exportBookings
const exportBookings = asyncHandler(async (req, res) => {
  const user = req.user;
  const { format = 'csv', filters = {}, options = {}, email } = req.body;

  // Permission: staff and above can export bookings; guests can export their own bookings
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
  
  // Set guest filter
  const query = { ...(filters || {}) };
  if (user.role === 'guest') {
    query.guestId = user._id;
  }

  // Validate date range using exportHelper
  const validation = exportHelper.validateExportRequest(user, 'bookings', filters);
  if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

  // Fetch data to include in export job
  const docs = await Booking.find(query).populate('guestId', 'name email').populate('roomId', 'roomNumber').lean();

  // Remove sensitive fields
  const formatted = exportHelper.formatExportData(docs, 'bookings', { 
    userRole: user.role, 
    removePrivateForNonAdmin: true, 
    privateFields: ['creditCard', 'ssn'] 
  });

  // Create job and enqueue
  const jobId = await _createAndEnqueue(
    user, 
    'bookings', 
    format, 
    filters, 
    { 
      ...options, 
      data: formatted, 
      filename: exportHelper.getExportFilename('bookings', format, user) 
    }, 
    docs.length > LARGE_EXPORT_THRESHOLD ? 'low' : 'normal'
  );

  res.json({ success: true, jobId, message: 'Bookings export queued' });
});

// 2. exportInvoices
const exportInvoices = asyncHandler(async (req, res) => {
  const user = req.user;
  const { format = 'csv', filters = {}, options = {}, email } = req.body;

  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  // Permission: staff and above
  if (!['admin', 'manager', 'staff'].includes(user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });

  const query = { ...(filters || {}) };
  if (user.role === 'guest') {
    // Need to find invoices through bookings for guest
    const bookings = await Booking.find({ guestId: user._id }).distinct('_id');
    query.bookingId = { $in: bookings };
  }
  
  const docs = await Invoice.find(query).populate('bookingId', 'bookingReference guestName').lean();
  const formatted = exportHelper.formatExportData(docs, 'invoices', { userRole: user.role, removePrivateForNonAdmin: true });

  const jobId = await _createAndEnqueue(
    user, 
    'invoices', 
    format, 
    filters, 
    { 
      ...options, 
      data: formatted, 
      filename: exportHelper.getExportFilename('invoices', format, user) 
    }, 
    docs.length > LARGE_EXPORT_THRESHOLD ? 'low' : 'normal'
  );

  res.json({ success: true, jobId, message: 'Invoices export queued' });
});

// 3. exportFinancial (FIXED VERSION)
const exportFinancial = asyncHandler(async (req, res) => {
  const user = req.user;
  const { format = 'csv', filters = {}, options = {}, email } = req.body;

  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (!['admin', 'manager'].includes(user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });

  try {
    // Aggregate financials with proper field names
    const match = { ...(filters || {}) };
    
    // Get payments data instead of invoices for financials
    const paymentAgg = await Payment.aggregate([
      { $match: { status: 'completed', ...match } },
      { $group: { 
          _id: null, 
          totalRevenue: { $sum: '$amount' }, 
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        } 
      }
    ]);
    
    // Also get invoice summary
    const invoiceAgg = await Invoice.aggregate([
      { $match: { status: 'paid', ...match } },
      { $group: { 
          _id: null, 
          totalInvoiced: { $sum: '$totalAmount' },
          invoiceCount: { $sum: 1 }
        } 
      }
    ]);

    const data = {
      payments: paymentAgg.length ? paymentAgg[0] : { totalRevenue: 0, count: 0, averageAmount: 0 },
      invoices: invoiceAgg.length ? invoiceAgg[0] : { totalInvoiced: 0, invoiceCount: 0 }
    };

    const formatted = exportHelper.formatExportData([data], 'financial', { userRole: user.role });

    const jobId = await _createAndEnqueue(
      user, 
      'financial', 
      format, 
      filters, 
      { 
        ...options, 
        data: formatted, 
        filename: exportHelper.getExportFilename('financial', format, user) 
      }
    );
    
    res.json({ success: true, jobId, message: 'Financial export queued' });
  } catch (error) {
    console.error('Financial export error:', error);
    res.status(500).json({ success: false, message: 'Failed to process financial export' });
  }
});

// 4. exportGuests
const exportGuests = asyncHandler(async (req, res) => {
  const user = req.user;
  const { format = 'csv', filters = {}, options = {}, email } = req.body;

  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (!['admin', 'manager'].includes(user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });

  const query = { role: 'guest', ...(filters || {}) };
  const docs = await User.find(query).select('-password -refreshToken -twoFactorSecret').lean();
  const formatted = exportHelper.formatExportData(docs, 'guests', { userRole: user.role, removePrivateForNonAdmin: false });

  const jobId = await _createAndEnqueue(
    user, 
    'guests', 
    format, 
    filters, 
    { 
      ...options, 
      data: formatted, 
      filename: exportHelper.getExportFilename('guests', format, user) 
    }, 
    docs.length > LARGE_EXPORT_THRESHOLD ? 'low' : 'normal'
  );

  res.json({ success: true, jobId, message: 'Guests export queued' });
});

// 5. exportSearch
const exportSearch = asyncHandler(async (req, res) => {
  const user = req.user;
  const { format = 'csv', searchQuery = {}, filters = {}, options = {}, target = 'bookings', email } = req.body;

  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  // Determine target model
  let model;
  switch (target) {
    case 'bookings': model = Booking; break;
    case 'invoices': model = Invoice; break;
    case 'users': model = User; break;
    case 'payments': model = Payment; break;
    case 'serviceRequests': model = ServiceRequest; break;
    default: model = Booking;
  }

  // Build query
  let query = {};
  if (typeof searchQuery === 'string') {
    const searchRegex = new RegExp(searchQuery, 'i');
    query.$or = [
      { guestName: searchRegex },
      { bookingReference: searchRegex },
      { guestEmail: searchRegex }
    ];
  } else if (typeof searchQuery === 'object') {
    query = { ...searchQuery };
  }

  // Merge additional filters
  query = { ...query, ...(filters || {}) };

  const docs = await model.find(query).lean();
  const formatted = exportHelper.formatExportData(docs, 'search', { userRole: user.role });

  const jobId = await _createAndEnqueue(
    user, 
    'search', 
    format, 
    { searchQuery, filters }, 
    { 
      ...options, 
      data: formatted, 
      filename: exportHelper.getExportFilename('search', format, user) 
    }, 
    docs.length > LARGE_EXPORT_THRESHOLD ? 'low' : 'normal'
  );

  res.json({ success: true, jobId, message: 'Search export queued' });
});

// 6. exportAnalytics
const exportAnalytics = asyncHandler(async (req, res) => {
  const user = req.user;
  const { format = 'csv', period = {}, metrics = [], options = {}, email } = req.body;

  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (!['admin', 'manager'].includes(user.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });

  try {
    // Lightweight analytics
    let analyticsData = [];
    try {
      const analyticsUtil = require('../utils/analytics');
      analyticsData = await analyticsUtil.generateReport(period, metrics, options);
    } catch (e) {
      // Fallback: simple invoice aggregation by status
      const match = {};
      analyticsData = await Invoice.aggregate([
        { $match: match },
        { $group: { _id: '$status', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
    }

    const formatted = exportHelper.formatExportData(analyticsData, 'analytics', { userRole: user.role });
    const jobId = await _createAndEnqueue(
      user, 
      'analytics', 
      format, 
      { period, metrics }, 
      { 
        ...options, 
        data: formatted, 
        filename: exportHelper.getExportFilename('analytics', format, user) 
      }
    );

    res.json({ success: true, jobId, message: 'Analytics export queued' });
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ success: false, message: 'Failed to process analytics export' });
  }
});

// 7. downloadExport
const downloadExport = asyncHandler(async (req, res) => {
  const user = req.user;
  const { jobId } = req.params;
  
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const job = await ExportJob.findOne({ jobId }).lean();
  if (!job) return res.status(404).json({ success: false, message: 'Export job not found' });
  if (job.status !== 'completed') return res.status(400).json({ success: false, message: 'Export is not ready for download' });

  // Only owner or admin
  if (String(job.user) !== String(user._id) && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Permission denied' });
  }

  const filePath = job.fileInfo && job.fileInfo.path;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Export file not found' });
  }

  // Stream file
  res.setHeader('Content-Disposition', `attachment; filename="${job.fileInfo.filename || path.basename(filePath)}"`);
  res.setHeader('Content-Type', job.fileInfo.mimeType || 'application/octet-stream');

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);

  stream.on('end', async () => {
    // Optional auto-delete
    if (job.options && job.options.autoDelete) {
      try {
        await fs.promises.unlink(filePath);
        await ExportJob.findOneAndUpdate({ jobId }, { status: 'expired' });
      } catch (e) {}
    }
  });

  stream.on('error', (err) => {
    console.error('Download stream error:', err);
    if (!res.headersSent) {
      res.status(500).end();
    }
  });
});

// 8. getExportHistory
const getExportHistory = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

  const { page = 1, limit = 20, status, exportType } = req.query;
  const query = {};
  
  // Admin can see all; others see own
  if (user.role !== 'admin') query.user = user._id;
  if (status) query.status = status;
  if (exportType) query.exportType = exportType;

  const skip = (Number(page) - 1) * Number(limit);
  const jobs = await ExportJob.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();
  const total = await ExportJob.countDocuments(query);

  res.json({ 
    success: true, 
    data: jobs, 
    pagination: { 
      page: Number(page), 
      limit: Number(limit), 
      total, 
      totalPages: Math.ceil(total / Number(limit)) 
    } 
  });
});

module.exports = {
  exportBookings,
  exportInvoices,
  exportFinancial,
  exportGuests,
  exportSearch,
  exportAnalytics,
  downloadExport,
  getExportHistory
};