const asyncHandler = require('express-async-handler');
const analytics = require('../utils/analytics');
const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Get comprehensive dashboard statistics
 * Includes occupancy, revenue, guest count, pending service requests
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get last 30 days for default date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get occupancy rate
    const occupancyResult = await analytics.calculateOccupancyRate(startDate, endDate);
    const occupancy = occupancyResult.success ? occupancyResult.data : { occupancyRate: 0 };

    // Get total guests
    const totalGuests = await User.countDocuments({ role: 'guest' });

    // Get revenue (last 30 days) - check your Payment model method name
    let revenue = 0;
    try {
      // Try different possible method names
      if (typeof Payment.getTotalRevenue === 'function') {
        const revenueStats = await Payment.getTotalRevenue({ startDate, endDate });
        revenue = revenueStats?.netRevenue || revenueStats?.total || 0;
      } else if (typeof Payment.calculateRevenue === 'function') {
        const revenueStats = await Payment.calculateRevenue(startDate, endDate);
        revenue = revenueStats?.total || 0;
      }
    } catch (revenueError) {
      console.warn('Revenue calculation failed, using 0:', revenueError.message);
    }

    // Get pending service requests
    const pendingRequests = await ServiceRequest.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });

    // Get total bookings
    const totalBookings = await Booking.countDocuments();

    // Get average booking value
    let avgBookingValue = 0;
    try {
      const bookingStats = await Booking.aggregate([
        { $group: { _id: null, avgAmount: { $avg: '$totalAmount' }, total: { $sum: '$totalAmount' } } }
      ]);
      avgBookingValue = bookingStats[0]?.avgAmount || 0;
    } catch (avgError) {
      console.warn('Average booking calculation failed:', avgError.message);
    }

    res.json({
      success: true,
      data: {
        occupancyRate: occupancy.occupancyRate || 0,
        totalGuests,
        revenue: parseFloat(revenue.toFixed(2)),
        pendingServiceRequests: pendingRequests,
        totalBookings,
        avgBookingValue: parseFloat(avgBookingValue.toFixed(2)),
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
});

/**
 * Get occupancy report for date range
 */
exports.getOccupancyReport = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate query parameters are required'
      });
    }

    const result = await analytics.calculateOccupancyRate(startDate, endDate);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Occupancy report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching occupancy report'
    });
  }
});

/**
 * Get guest demographics analytics
 */
exports.getGuestAnalytics = asyncHandler(async (req, res) => {
  try {
    const result = await analytics.analyzeGuestDemographics();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Guest analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching guest analytics'
    });
  }
});

/**
 * Get service usage analytics
 */
exports.getServiceAnalytics = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const result = await analytics.analyzeServiceUsage(startDate || null, endDate || null);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Service analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching service analytics'
    });
  }
});

/**
 * Get booking trends
 */
exports.getBookingTrends = asyncHandler(async (req, res) => {
  try {
    const { timeframe = 'monthly', startDate, endDate } = req.query;

    // Validate timeframe
    const validTimeframes = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: `Invalid timeframe. Allowed: ${validTimeframes.join(', ')}`
      });
    }

    const result = await analytics.getBookingTrends(
      timeframe,
      startDate || null,
      endDate || null
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Booking trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booking trends'
    });
  }
});