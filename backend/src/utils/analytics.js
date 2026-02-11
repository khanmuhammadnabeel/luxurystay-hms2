const Booking = require('../models/Booking');
const Room = require('../models/Room');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

/**
 * Calculate hotel occupancy rate for a date range
 * Formula: (sum of booked nights / total room-nights available) * 100
 * @param {Date} startDate - Start date for analysis
 * @param {Date} endDate - End date for analysis
 * @returns {Promise<Object>} Occupancy analysis
 */
async function calculateOccupancyRate(startDate, endDate) {
  try {
    if (!startDate || !endDate) {
      return { success: false, message: 'Start date and end date are required' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return { success: false, message: 'Start date must be before end date' };
    }

    // Get total number of rooms
    const totalRooms = await Room.countDocuments();
    if (totalRooms === 0) {
      return {
        success: true,
        data: {
          occupancyRate: 0,
          totalRooms: 0,
          bookedNights: 0,
          availableNights: 0,
          dates: { start, end }
        }
      };
    }

    // Calculate total available nights
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalAvailableNights = totalRooms * totalDays;

    // Get all confirmed/checked-in bookings in date range
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'checked-in'] },
      checkInDate: { $lt: end },
      checkOutDate: { $gt: start }
    });

    // Calculate booked nights
    let bookedNights = 0;
    bookings.forEach((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);

      // Adjust dates to stay within range
      const rangeStart = checkIn < start ? start : checkIn;
      const rangeEnd = checkOut > end ? end : checkOut;

      const nights = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
      bookedNights += nights;
    });

    const occupancyRate = totalAvailableNights > 0 ? (bookedNights / totalAvailableNights * 100).toFixed(2) : 0;

    return {
      success: true,
      data: {
        occupancyRate: parseFloat(occupancyRate),
        totalRooms,
        bookedNights,
        availableNights: totalAvailableNights,
        dates: { start, end }
      }
    };
  } catch (error) {
    console.error('Error calculating occupancy rate:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Analyze guest demographics from User model
 * Groups by nationality and age groups
 * @returns {Promise<Object>} Guest demographics analysis
 */
async function analyzeGuestDemographics() {
  try {
    // Get all guests
    const guests = await User.find({ role: 'guest' });

    if (guests.length === 0) {
      return {
        success: true,
        data: {
          totalGuests: 0,
          byNationality: {},
          byAgeGroup: {},
          repeatVisits: 0
        }
      };
    }

    // Analyze by nationality (if field exists)
    const byNationality = {};
    guests.forEach((guest) => {
      const nationality = guest.nationality || 'Not Specified';
      byNationality[nationality] = (byNationality[nationality] || 0) + 1;
    });

    // Analyze by age group (if birthdate exists)
    const byAgeGroup = {
      '<18': 0,
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0,
      'Not Specified': 0
    };

    const now = new Date();
    guests.forEach((guest) => {
      if (guest.birthDate) {
        const birthDate = new Date(guest.birthDate);
        const age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        const adjustedAge = monthDiff < 0 ? age - 1 : age;

        if (adjustedAge < 18) byAgeGroup['<18']++;
        else if (adjustedAge <= 25) byAgeGroup['18-25']++;
        else if (adjustedAge <= 35) byAgeGroup['26-35']++;
        else if (adjustedAge <= 45) byAgeGroup['36-45']++;
        else if (adjustedAge <= 55) byAgeGroup['46-55']++;
        else if (adjustedAge <= 65) byAgeGroup['56-65']++;
        else byAgeGroup['65+']++;
      } else {
        byAgeGroup['Not Specified']++;
      }
    });

    // Calculate repeat visits (guests with multiple bookings)
    const bookingCounts = await Booking.aggregate([
      { $group: { _id: '$guestId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    const repeatVisits = bookingCounts.length;

    return {
      success: true,
      data: {
        totalGuests: guests.length,
        byNationality,
        byAgeGroup,
        repeatVisits
      }
    };
  } catch (error) {
    console.error('Error analyzing guest demographics:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Analyze service usage and popularity
 * @param {Date} startDate - Start date for analysis (optional)
 * @param {Date} endDate - End date for analysis (optional)
 * @returns {Promise<Object>} Service usage analysis
 */
async function analyzeServiceUsage(startDate = null, endDate = null) {
  try {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { success: false, message: 'Start date must be before end date' };
    }

    let filter = {};

    if (startDate && endDate) {
      filter.requestedTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all service requests with populated service details
    const requests = await ServiceRequest.find(filter)
      .populate('serviceDetails', 'name category price');

    if (requests.length === 0) {
      return {
        success: true,
        data: {
          popularServices: [],
          revenueByCategory: {},
          totalServiceRevenue: 0,
          usageStats: { totalRequests: 0, deliveredRequests: 0, cancelledRequests: 0 }
        }
      };
    }

    // Count service popularity
    const serviceCountMap = {};
    const categoryRevenueMap = {};
    let totalRevenue = 0;

    requests.forEach((request) => {
      const service = request.serviceDetails;
      if (!service) return;

      // Count usages
      const serviceName = service.name || 'Unknown';
      serviceCountMap[serviceName] = (serviceCountMap[serviceName] || 0) + (request.quantity || 1);

      // Calculate revenue by category
      const category = service.category || 'other';
      const revenue = request.totalPrice || 0;
      categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + revenue;
      totalRevenue += revenue;
    });

    // Sort services by popularity
    const popularServices = Object.entries(serviceCountMap)
      .map(([name, count]) => ({ service: name, usageCount: count }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    // Count status breakdown
    const statusStats = await ServiceRequest.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const usageStats = {
      totalRequests: requests.length,
      deliveredRequests: statusStats.find(s => s._id === 'delivered')?.count || 0,
      cancelledRequests: statusStats.find(s => s._id === 'cancelled')?.count || 0,
      byStatus: statusStats
    };

    return {
      success: true,
      data: {
        popularServices,
        revenueByCategory: categoryRevenueMap,
        totalServiceRevenue: parseFloat(totalRevenue.toFixed(2)),
        usageStats
      }
    };
  } catch (error) {
    console.error('Error analyzing service usage:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Analyze booking trends over time
 * @param {String} timeframe - 'daily' | 'weekly' | 'monthly' | 'yearly'
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 * @returns {Promise<Object>} Booking trend analysis
 */
async function getBookingTrends(timeframe = 'monthly', startDate = null, endDate = null) {
  try {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { success: false, message: 'Start date must be before end date' };
    }

    let filter = {};
    let groupBy = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Set grouping based on timeframe
    switch (timeframe) {
      case 'daily':
        groupBy = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        };
        break;
      case 'weekly':
        // Use year-week format to avoid week number reset
        groupBy = {
          $dateToString: { format: '%Y-%U', date: '$createdAt' }
        };
        break;
      case 'monthly':
        groupBy = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        };
        break;
      case 'yearly':
        groupBy = {
          $year: '$createdAt'
        };
        break;
      default:
        groupBy = {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        };
    }

    // Aggregate bookings by timeframe
    const trends = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 100 } // Prevent huge datasets
    ]);

    if (trends.length === 0) {
      return {
        success: true,
        data: {
          labels: [],
          data: [],
          trend: 'stable',
          timeframe,
          totalBookings: 0
        }
      };
    }

    const labels = trends.map(t => t._id?.toString() || 'Unknown');
    const data = trends.map(t => t.count || 0);

    // Calculate trend direction
    let trendDirection = 'stable';
    if (data.length > 1) {
      const firstHalf = data.slice(0, Math.floor(data.length / 2)).reduce((a, b) => a + b, 0);
      const secondHalf = data.slice(Math.floor(data.length / 2)).reduce((a, b) => a + b, 0);
      
      if (secondHalf > firstHalf) trendDirection = 'up';
      else if (secondHalf < firstHalf) trendDirection = 'down';
    }

    const totalBookings = data.reduce((a, b) => a + b, 0);

    return {
      success: true,
      data: {
        labels,
        data,
        trend: trendDirection,
        timeframe,
        totalBookings
      }
    };
  } catch (error) {
    console.error('Error analyzing booking trends:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Generate comprehensive hotel report
 * @param {String} reportType - 'occupancy'|'guest_analysis'|'service_usage'|'booking_trends'
 * @param {Object} filters - Date range and other filters
 * @returns {Promise<Object>} Formatted report
 */
async function generateHotelReport(reportType, filters = {}) {
  try {
    const { startDate, endDate, timeframe = 'monthly' } = filters;

    switch (reportType) {
      case 'occupancy':
        return await calculateOccupancyRate(
          startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
          endDate || new Date()
        );

      case 'guest_analysis':
        return await analyzeGuestDemographics();

      case 'service_usage':
        return await analyzeServiceUsage(startDate, endDate);

      case 'booking_trends':
        return await getBookingTrends(timeframe, startDate, endDate);

      default:
        return {
          success: false,
          message: `Unknown report type: ${reportType}. Available: occupancy, guest_analysis, service_usage, booking_trends`
        };
    }
  } catch (error) {
    console.error('Error generating hotel report:', error);
    return { success: false, message: error.message };
  }
}

module.exports = {
  calculateOccupancyRate,
  analyzeGuestDemographics,
  analyzeServiceUsage,
  getBookingTrends,
  generateHotelReport
};