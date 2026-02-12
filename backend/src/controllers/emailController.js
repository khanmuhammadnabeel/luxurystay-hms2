const asyncHandler = require('express-async-handler');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
const User = require('../models/User');
const emailQueue = require('../services/emailQueue');

// 1x1 transparent GIF pixel for tracking opens
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * 1. Send Transactional Email
 * POST /api/email/send
 */
exports.sendTransactionalEmail = asyncHandler(async (req, res) => {
  const { templateName, recipient, data = {}, priority = 'normal', metadata = {} } = req.body;

  if (!templateName || !recipient) {
    return res.status(400).json({
      success: false,
      message: 'templateName and recipient are required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipient)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid recipient email format'
    });
  }

  const template = await EmailTemplate.getByName(templateName);
  if (!template) {
    return res.status(404).json({
      success: false,
      message: `Template "${templateName}" not found`
    });
  }

  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
    });
  }

  const emailLog = new EmailLog({
    templateId: template._id,
    recipient: { email: recipient },
    subject: template.subject,
    category: template.category,
    status: 'queued',
    metadata: {
      ...metadata,
      userId: req.user?._id,
      userRole: req.user?.role,
      sentBy: req.user?.email
    }
  });

  await emailLog.save();

  await emailQueue.addToQueue({
    to: recipient,
    subject: template.subject,
    html: '', // Rendered by queue processor
    text: '',
    category: template.category,
    templateName,
    templateData: data,
    priority,
    metadata: {
      emailLogId: emailLog._id,
      userId: req.user?._id,
      userRole: req.user?.role
    }
  }, priority);

  res.status(202).json({
    success: true,
    data: {
      queued: true,
      emailLogId: emailLog._id,
      priority,
      message: 'Email queued for sending'
    }
  });
});

/**
 * 2. Send Bulk Email
 * POST /api/email/bulk
 */
exports.sendBulkEmail = asyncHandler(async (req, res) => {
  const { templateName, recipients = [], data = {}, scheduleDate } = req.body;

  if (!templateName || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'templateName and recipients array are required'
    });
  }

  if (recipients.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 1000 recipients per batch'
    });
  }

  const template = await EmailTemplate.getByName(templateName);
  if (!template) {
    return res.status(404).json({
      success: false,
      message: `Template "${templateName}" not found`
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = recipients.filter(email => !emailRegex.test(email));
  if (invalidEmails.length > 0) {
    return res.status(400).json({
      success: false,
      message: `${invalidEmails.length} invalid email addresses found`
    });
  }

  const unsubscribedUsers = await User.find(
    { email: { $in: recipients }, 'emailPreferences.unsubscribed': true },
    { email: 1 }
  );
  const unsubscribedEmails = unsubscribedUsers.map(u => u.email);
  const validRecipients = recipients.filter(email => !unsubscribedEmails.includes(email));

  if (validRecipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'All recipients are unsubscribed'
    });
  }

  const batchId = `bulk-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const emailLogs = await EmailLog.insertMany(
    validRecipients.map(email => ({
      templateId: template._id,
      recipient: { email },
      subject: template.subject,
      category: template.category,
      status: scheduleDate ? 'scheduled' : 'queued',
      batchId,
      metadata: {
        bulkSend: true,
        userId: req.user._id,
        userRole: req.user.role,
        sentBy: req.user.email,
        scheduledFor: scheduleDate || null
      }
    }))
  );

  const queuePromises = emailLogs.map(emailLog =>
    emailQueue.addToQueue({
      to: emailLog.recipient.email,
      subject: template.subject,
      html: '',
      text: '',
      category: template.category,
      templateName,
      templateData: data,
      priority: 'normal',
      metadata: {
        emailLogId: emailLog._id,
        batchId,
        scheduledFor: scheduleDate
      }
    }, 'normal')
  );

  await Promise.allSettled(queuePromises);

  res.status(202).json({
    success: true,
    data: {
      batchId,
      queuedCount: validRecipients.length,
      skippedCount: recipients.length - validRecipients.length,
      scheduled: !!scheduleDate,
      scheduledFor: scheduleDate || null,
      message: `${validRecipients.length} emails queued for sending`
    }
  });
});

/**
 * 3. Get Email Logs
 * GET /api/email/logs
 */
exports.getEmailLogs = asyncHandler(async (req, res) => {
  const {
    status,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    search
  } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { 'recipient.email': { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [totalCount, logs, summary] = await Promise.all([
    EmailLog.countDocuments(filter),
    EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('templateId', 'name category'),
    EmailLog.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const summaryMap = summary.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      summary: {
        queued: summaryMap.queued || 0,
        sent: summaryMap.sent || 0,
        delivered: summaryMap.delivered || 0,
        opened: summaryMap.opened || 0,
        clicked: summaryMap.clicked || 0,
        failed: summaryMap.failed || 0,
        total: totalCount
      }
    }
  });
});

/**
 * 4. Get Email Stats
 * GET /api/email/stats
 */
exports.getEmailStats = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  const validPeriods = ['day', 'week', 'month', 'year'];
  if (!validPeriods.includes(period)) {
    return res.status(400).json({
      success: false,
      message: `Invalid period. Must be one of: ${validPeriods.join(', ')}`
    });
  }

  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const stats = await EmailLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: now }
      }
    },
    {
      $group: {
        _id: null,
        totalSent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
        totalDelivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        totalOpened: { $sum: { $cond: [{ $gt: ['$tracking.openCount', 0] }, 1, 0] } },
        totalClicked: { $sum: { $cond: [{ $gt: ['$tracking.clickCount', 0] }, 1, 0] } },
        totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        totalQueued: { $sum: { $cond: [{ $eq: ['$status', 'queued'] }, 1, 0] } }
      }
    }
  ]);

  const statsData = stats[0] || {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalFailed: 0,
    totalQueued: 0
  };

  const { totalSent, totalDelivered, totalOpened, totalClicked, totalFailed } = statsData;

  res.json({
    success: true,
    data: {
      period,
      startDate,
      endDate: now,
      metrics: {
        sent: totalSent,
        delivered: totalDelivered,
        opened: totalOpened,
        clicked: totalClicked,
        failed: totalFailed,
        queued: statsData.totalQueued
      },
      rates: {
        deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(2) : 0,
        openRate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(2) : 0,
        clickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(2) : 0,
        bounceRate: totalSent > 0 ? ((totalFailed / totalSent) * 100).toFixed(2) : 0
      }
    }
  });
});

/**
 * 5. Track Email Open
 * GET /api/email/track/open/:id
 * NO AUTH - Tracking pixel endpoint
 */
exports.trackOpen = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id) {
    setImmediate(async () => {
      try {
                await EmailLog.findByIdAndUpdate(
          id,
          {
            status: 'opened',
            $inc: { 'tracking.openCount': 1 },
            $set: {
              'tracking.lastOpenedAt': new Date()
            },
            $setOnInsert: {
              'tracking.firstOpenedAt': new Date()
            }
          }
        );
      } catch (err) {
        console.error('Error tracking email open:', err.message);
      }
    });
  }

  res.set('Content-Type', 'image/gif');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(TRACKING_PIXEL);
});

/**
 * 6. Track Email Click
 * GET /api/email/track/click/:id
 * NO AUTH - Tracking redirect endpoint
 */
exports.trackClick = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'URL parameter is required'
    });
  }

  if (id) {
    setImmediate(async () => {
      try {
        await EmailLog.findByIdAndUpdate(
          id,
          {
            $inc: { 'tracking.clickCount': 1 },
            $set: {
              status: 'clicked',
              'tracking.lastClickedAt': new Date(),
              'tracking.lastClickedUrl': url
            }
          }
        );
      } catch (err) {
        console.error('Error tracking email click:', err.message);
      }
    });
  }

  res.redirect(302, url);
});

/**
 * 7. Preview Email Template
 * GET /api/email/preview/:templateName
 */
exports.previewTemplate = asyncHandler(async (req, res) => {
  const { templateName } = req.params;
  let customData = {};

  if (req.query.data) {
    try {
      customData = JSON.parse(req.query.data);
    } catch (err) {
      console.warn('Failed to parse custom data:', err.message);
    }
  }

  const template = await EmailTemplate.getByName(templateName);
  if (!template) {
    return res.status(404).json({
      success: false,
      message: `Template "${templateName}" not found`
    });
  }

  const sampleData = {
    hotelName: 'LuxuryStay Hotel',
    hotelEmail: 'contact@luxurystay.com',
    hotelPhone: '+92-300-LUXURY-1',
    hotelWebsite: 'www.luxurystay.com',
    hotelLogo: 'https://luxurystay.com/logo.png',
    hotelAddress: 'Luxury Avenue, Downtown District',
    hotelCity: 'Karachi',
    hotelCountry: 'Pakistan',
    year: new Date().getFullYear(),
    guestName: 'John Doe',
    roomNumber: '501',
    bookingReference: 'LUX-2026-123456',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    totalAmount: 'Rs. 50,000',
    amount: 'Rs. 50,000',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-20260213-789654',
    date: new Date().toDateString(),
    invoiceNumber: 'INV-2026-001234',
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    downloadLink: 'https://luxurystay.com/invoice/INV-2026-001234',
    refundAmount: 'Rs. 45,000',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    resetLink: 'https://luxurystay.com/password-reset/token123',
    loginLink: 'https://luxurystay.com/login',
    expiryMinutes: '30',
    bookingLink: 'https://luxurystay.com/booking/LUX-2026-123456',
    feedbackLink: 'https://luxurystay.com/feedback/LUX-2026-123456',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=luxurystay.com',
    weatherForecast: 'Sunny, 28°C',
    iosAppLink: 'https://apps.apple.com/app/luxurystay',
    androidAppLink: 'https://play.google.com/store/apps/details?id=com.luxurystay'
  };

  const finalData = { ...sampleData, ...customData };
  const rendered = template.render(finalData);

  const variableRegex = /\{\{\s*(\w+)\s*\}\}/g;
  const variables = new Set();
  let match;
  const content = template.content.html || template.content.mjml || '';
  while ((match = variableRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  res.json({
    success: true,
    data: {
      templateName,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      variables: Array.from(variables),
      usedVariables: finalData,
      preview: true
    }
  });
});