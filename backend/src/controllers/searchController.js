/**
 * Search Controller
 * Global search across all hotel management modules with advanced filtering
 */

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Service = require('../models/Service'); // ✅ ADDED
const ServiceRequest = require('../models/ServiceRequest');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const EmailLog = require('../models/EmailLog');
const File = require('../models/File');
const mongoose = require('mongoose');

const {
  buildSearchQuery,
  buildAdvancedSearchQuery,
  sanitizeSearchTerm,
  extractKeywords,
  highlightMatches,
  getSearchableFields,
  getPaginationOptions,
  calculateTotalPages,
  buildSortOptions
} = require('../utils/searchHelper');

const asyncHandler = require('express-async-handler');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get role-based filter to restrict search results
 */
function getRoleBasedFilter(user) {
  if (!user) return {};

  switch (user.role) {
    case 'admin':
      return {}; // Admin sees everything

    case 'manager':
      return {}; // Manager sees all operational data

    case 'staff':
      // Staff sees only assigned data
      return { assignedStaff: { $in: [user._id] } };

    case 'guest':
      // Guest sees only their own bookings
      return { guestId: user._id };

    default:
      return { guestId: user._id }; // Default to guest restrictions
  }
}

/**
 * Highlight search term in object fields
 */
function highlightInObject(obj, searchTerm, fields) {
  const highlighted = { ...obj };

  if (!searchTerm || !fields) return highlighted;

  fields.forEach(field => {
    if (highlighted[field] && typeof highlighted[field] === 'string') {
      highlighted[field] = highlightMatches(highlighted[field], searchTerm, {
        maxLength: 200,
        ellipsis: true
      });
    }
  });

  return highlighted;
}

/**
 * Convert results to plain objects and add highlighting
 */
function formatResults(docs, searchTerm, highlightFields) {
  return docs.map(doc => {
    const plain = doc.toObject ? doc.toObject() : doc;
    return highlightInObject(plain, searchTerm, highlightFields);
  });
}

// ============================================================================
// 1. GLOBAL SEARCH (All Models)
// ============================================================================

/**
 * Search across ALL modules with pagination
 * GET /api/search/global
 * Query: q (required), page, limit, sortBy, sortOrder
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const user = req.user;

  // Validate search term
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search term is required'
    });
  }

  // Get pagination options
  const { skip, limit: queryLimit, page: currentPage } = getPaginationOptions(page, limit);
  const sortOptions = buildSortOptions(sortBy, sortOrder);

  // Build search query
  const searchTermSanitized = sanitizeSearchTerm(q);
  const bookingFields = getSearchableFields('Booking');
  const roomFields = getSearchableFields('Room');
  const userFields = getSearchableFields('User');
  const invoiceFields = getSearchableFields('Invoice');
  const serviceFields = getSearchableFields('Service'); // ✅ DEFINED HERE
  const serviceRequestFields = getSearchableFields('ServiceRequest');
  const feedbackFields = getSearchableFields('Feedback');
  const complaintFields = getSearchableFields('Complaint');
  const maintenanceFields = getSearchableFields('MaintenanceRequest');
  const emailFields = getSearchableFields('EmailLog');
  const fileFields = getSearchableFields('File');

  try {
    // Execute parallel searches
    const [
      bookingResults,
      bookingTotal,
      roomResults,
      roomTotal,
      userResults,
      userTotal,
      invoiceResults,
      invoiceTotal,
      serviceResults,
      serviceTotal,
      serviceRequestResults,
      serviceRequestTotal,
      feedbackResults,
      feedbackTotal,
      complaintResults,
      complaintTotal,
      maintenanceResults,
      maintenanceTotal,
      emailResults,
      emailTotal,
      fileResults,
      fileTotal
    ] = await Promise.all([
      // Bookings
      Booking.find(
        buildSearchQuery(q, bookingFields)
      )
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit)
        .populate('guestId', 'name email')
        .populate('roomId', 'roomNumber'),
      Booking.countDocuments(buildSearchQuery(q, bookingFields)),

      // Rooms
      Room.find(buildSearchQuery(q, roomFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit),
      Room.countDocuments(buildSearchQuery(q, roomFields)),

      // Users (admin only for full results)
      user?.role === 'admin'
        ? User.find(buildSearchQuery(q, userFields))
            .select('-password -refreshToken')
            .sort(sortOptions)
            .skip(skip)
            .limit(queryLimit)
        : User.find({
            ...buildSearchQuery(q, userFields),
            isActive: true,
            role: { $ne: 'admin' }
          })
            .select('-password -refreshToken')
            .sort(sortOptions)
            .skip(skip)
            .limit(queryLimit),
      user?.role === 'admin'
        ? User.countDocuments(buildSearchQuery(q, userFields))
        : User.countDocuments({
            ...buildSearchQuery(q, userFields),
            isActive: true,
            role: { $ne: 'admin' }
          }),

      // Invoices
      Invoice.find(buildSearchQuery(q, invoiceFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit)
        .populate('bookingId', 'bookingReference guestName'),
      Invoice.countDocuments(buildSearchQuery(q, invoiceFields)),

      // Services ✅ FIXED - using Service model
      Service.find(buildSearchQuery(q, serviceFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit),
      Service.countDocuments(buildSearchQuery(q, serviceFields)),

      // Service Requests
      ServiceRequest.find(buildSearchQuery(q, serviceRequestFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit),
      ServiceRequest.countDocuments(buildSearchQuery(q, serviceRequestFields)),

      // Feedback
      Feedback.find(buildSearchQuery(q, feedbackFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit)
        .populate('bookingId', 'bookingReference guestName'),
      Feedback.countDocuments(buildSearchQuery(q, feedbackFields)),

      // Complaints
      Complaint.find(buildSearchQuery(q, complaintFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit)
        .populate('guestId', 'name email'),
      Complaint.countDocuments(buildSearchQuery(q, complaintFields)),

      // Maintenance Requests
      MaintenanceRequest.find(buildSearchQuery(q, maintenanceFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit)
        .populate('roomId', 'roomNumber'),
      MaintenanceRequest.countDocuments(buildSearchQuery(q, maintenanceFields)),

      // Email Logs (admin only)
      user?.role === 'admin'
        ? EmailLog.find(buildSearchQuery(q, emailFields))
            .sort(sortOptions)
            .skip(skip)
            .limit(queryLimit)
        : [],
      user?.role === 'admin'
        ? EmailLog.countDocuments(buildSearchQuery(q, emailFields))
        : 0,

      // Files
      File.find(buildSearchQuery(q, fileFields))
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit)
        .populate('uploadedBy', 'name email'),
      File.countDocuments(buildSearchQuery(q, fileFields))
    ]);

    // Format results with highlighting
    const formattedData = {
      bookings: {
        results: formatResults(bookingResults, q, bookingFields),
        total: bookingTotal
      },
      rooms: {
        results: formatResults(roomResults, q, roomFields),
        total: roomTotal
      },
      users: {
        results: formatResults(userResults, q, userFields),
        total: userTotal
      },
      invoices: {
        results: formatResults(invoiceResults, q, invoiceFields),
        total: invoiceTotal
      },
      services: {
        results: formatResults(serviceResults, q, serviceFields),
        total: serviceTotal
      },
      serviceRequests: {
        results: formatResults(serviceRequestResults, q, serviceRequestFields),
        total: serviceRequestTotal
      },
      feedback: {
        results: formatResults(feedbackResults, q, feedbackFields),
        total: feedbackTotal
      },
      complaints: {
        results: formatResults(complaintResults, q, complaintFields),
        total: complaintTotal
      },
      maintenance: {
        results: formatResults(maintenanceResults, q, maintenanceFields),
        total: maintenanceTotal
      },
      emailLogs: user?.role === 'admin' ? {
        results: formatResults(emailResults, q, emailFields),
        total: emailTotal
      } : { results: [], total: 0 },
      files: {
        results: formatResults(fileResults, q, fileFields),
        total: fileTotal
      }
    };

    // Calculate total results
    const totalResults = bookingTotal + roomTotal + userTotal + invoiceTotal +
                        serviceTotal + serviceRequestTotal + feedbackTotal + 
                        complaintTotal + maintenanceTotal + 
                        (user?.role === 'admin' ? emailTotal : 0) + fileTotal;

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        page: currentPage,
        limit: queryLimit,
        totalResults,
        totalPages: calculateTotalPages(totalResults, queryLimit)
      }
    });
  } catch (error) {
    console.error('Global search error:', error);
    throw error;
  }
});

// ============================================================================
// 2. SEARCH BOOKINGS
// ============================================================================

/**
 * Search bookings with advanced filters
 * GET /api/search/bookings
 * Query: q, status, startDate, endDate, guestName, roomNumber, page, limit, sortBy, sortOrder
 */
const searchBookings = asyncHandler(async (req, res) => {
  const {
    q,
    status,
    startDate,
    endDate,
    guestName,
    roomNumber,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const { skip, limit: queryLimit, page: currentPage } = getPaginationOptions(page, limit);
  const sortOptions = buildSortOptions(sortBy, sortOrder);

  // Build query
  let query = {};

  if (q) {
    const searchFields = getSearchableFields('Booking');
    query = buildSearchQuery(q, searchFields);
  }

  // Add filters
  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }

  if (startDate || endDate) {
    query.checkInDate = {};
    if (startDate) query.checkInDate.$gte = new Date(startDate);
    if (endDate) query.checkInDate.$lte = new Date(endDate);
  }

  if (guestName) {
    query.guestName = { $regex: sanitizeSearchTerm(guestName), $options: 'i' };
  }

  if (roomNumber) {
    query.roomId = roomNumber;
  }

  try {
    const [results, total] = await Promise.all([
      Booking.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit)
        .populate('guestId', 'name email phone')
        .populate('roomId', 'roomNumber name type'),

      Booking.countDocuments(query)
    ]);

    const formattedResults = formatResults(results, q, getSearchableFields('Booking'));

    res.json({
      success: true,
      data: formattedResults,
      pagination: {
        page: currentPage,
        limit: queryLimit,
        total,
        totalPages: calculateTotalPages(total, queryLimit)
      }
    });
  } catch (error) {
    console.error('Search bookings error:', error);
    throw error;
  }
});

// ============================================================================
// 3. SEARCH ROOMS
// ============================================================================

/**
 * Search rooms with advanced filters
 * GET /api/search/rooms
 * Query: q, type, status, minPrice, maxPrice, amenities, page, limit, sortBy, sortOrder
 */
const searchRooms = asyncHandler(async (req, res) => {
  const {
    q,
    type,
    status,
    minPrice,
    maxPrice,
    amenities,
    page = 1,
    limit = 20,
    sortBy = 'roomNumber',
    sortOrder = 'asc'
  } = req.query;

  const { skip, limit: queryLimit, page: currentPage } = getPaginationOptions(page, limit);
  const sortOptions = buildSortOptions(sortBy, sortOrder);

  // Build query
  let query = {};

  if (q) {
    const searchFields = getSearchableFields('Room');
    query = buildSearchQuery(q, searchFields);
  }

  if (type) {
    query.type = Array.isArray(type) ? { $in: type } : type;
  }

  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }

  if (minPrice || maxPrice) {
    query.pricePerNight = {};
    if (minPrice) query.pricePerNight.$gte = parseFloat(minPrice);
    if (maxPrice) query.pricePerNight.$lte = parseFloat(maxPrice);
  }

  if (amenities) {
    const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
    query.amenities = { $in: amenitiesArray };
  }

  try {
    const [results, total] = await Promise.all([
      Room.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit),

      Room.countDocuments(query)
    ]);

    const formattedResults = formatResults(results, q, getSearchableFields('Room'));

    res.json({
      success: true,
      data: formattedResults,
      pagination: {
        page: currentPage,
        limit: queryLimit,
        total,
        totalPages: calculateTotalPages(total, queryLimit)
      }
    });
  } catch (error) {
    console.error('Search rooms error:', error);
    throw error;
  }
});

// ============================================================================
// 4. SEARCH USERS (Admin/Manager Only)
// ============================================================================

/**
 * Search users with advanced filters
 * GET /api/search/users
 * Query: q, role, isActive, startDate, endDate, page, limit, sortBy, sortOrder
 * Authorization: admin/manager only
 */
const searchUsers = asyncHandler(async (req, res) => {
  // Check authorization
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized. Admin or Manager access required.'
    });
  }

  const {
    q,
    role,
    isActive,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const { skip, limit: queryLimit, page: currentPage } = getPaginationOptions(page, limit);
  const sortOptions = buildSortOptions(sortBy, sortOrder);

  // Build query
  let query = {};

  if (q) {
    const searchFields = getSearchableFields('User');
    query = buildSearchQuery(q, searchFields);
  }

  if (role) {
    query.role = Array.isArray(role) ? { $in: role } : role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  try {
    const [results, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort(sortOptions)
        .skip(skip)
        .limit(queryLimit),

      User.countDocuments(query)
    ]);

    const formattedResults = formatResults(results, q, getSearchableFields('User'));

    res.json({
      success: true,
      data: formattedResults,
      pagination: {
        page: currentPage,
        limit: queryLimit,
        total,
        totalPages: calculateTotalPages(total, queryLimit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    throw error;
  }
});

// ============================================================================
// 5. GET SUGGESTIONS (Type-Ahead)
// ============================================================================

/**
 * Get type-ahead suggestions
 * GET /api/search/suggest
 * Query: q (required), limit
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const { q, limit = 5 } = req.query;

  // Validate search term
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search term is required'
    });
  }

  const limitNum = Math.min(parseInt(limit) || 5, 20); // Max 20
  const searchTerm = sanitizeSearchTerm(q);

  try {
    const [bookings, rooms, users] = await Promise.all([
      // Booking suggestions
      Booking.find({
        $or: [
          { bookingReference: { $regex: searchTerm, $options: 'i' } },
          { guestName: { $regex: searchTerm, $options: 'i' } }
        ]
      })
        .select('bookingReference guestName')
        .limit(limitNum),

      // Room suggestions
      Room.find({
        roomNumber: { $regex: searchTerm, $options: 'i' }
      })
        .select('roomNumber')
        .limit(limitNum),

      // User suggestions
      User.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      })
        .select('name email')
        .limit(limitNum)
    ]);

    // Format suggestions
    const suggestions = [
      ...bookings.map(b => ({
        type: 'booking',
        value: b.bookingReference,
        label: `Booking: ${b.guestName} - ${b.bookingReference}`
      })),
      ...rooms.map(r => ({
        type: 'room',
        value: r.roomNumber,
        label: `Room: ${r.roomNumber}`
      })),
      ...users.map(u => ({
        type: 'user',
        value: u.name,
        label: `User: ${u.name} (${u.email})`
      }))
    ];

    res.json({
      success: true,
      data: suggestions.slice(0, limitNum)
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    throw error;
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  globalSearch,
  searchBookings,
  searchRooms,
  searchUsers,
  getSuggestions
};