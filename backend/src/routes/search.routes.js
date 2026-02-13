/**
 * @swagger
 * /api/search/suggest:
 *   get:
 *     tags:
 *       - Search
 *     summary: Get search suggestions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [booking, room, user]
 *                       value:
 *                         type: string
 *                       label:
 *                         type: string
 */
/**
 * @swagger
 * /api/search/global:
 *   get:
 *     tags:
 *       - Search
 *     summary: Global search across all collections
 *     description: Search bookings, rooms, users, invoices, etc.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: luxury double room
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: object
 *                     rooms:
 *                       type: object
 *                     users:
 *                       type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

// Your existing search routes code below...

/**
 * Search Routes
 * Global search and filtering endpoints for hotel management system
 */

const express = require('express');
const router = express.Router();
const {
  globalSearch,
  searchBookings,
  searchRooms,
  searchUsers,
  getSuggestions
} = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');
const { query, validationResult } = require('express-validator');

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/search/global
 * Global search across all modules
 * Query: q, page, limit, sortBy, sortOrder
 */
router.get(
  '/global',
  authenticate,
  [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be 1-100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be 1-100'),
    query('sortBy')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', 'ascending', 'descending'])
      .withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  globalSearch
);

/**
 * GET /api/search/bookings
 * Search bookings with filters
 * Query: q, status, startDate, endDate, guestName, roomNumber, page, limit, sortBy, sortOrder
 */
router.get(
  '/bookings',
  authenticate,
  [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be 1-100 characters'),
    query('status')
      .optional()
      .isIn(['confirmed', 'checked-in', 'checked-out', 'cancelled', 'pending'])
      .withMessage('Invalid booking status'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format'),
    query('guestName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Guest name must be 1-100 characters'),
    query('roomNumber')
      .optional()
      .trim()
      .isLength({ min: 1, max: 10 })
      .withMessage('Room number invalid'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be 1-100'),
    query('sortBy')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', 'ascending', 'descending'])
      .withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  searchBookings
);

/**
 * GET /api/search/rooms
 * Search rooms with filters
 * Query: q, type, status, minPrice, maxPrice, amenities, page, limit, sortBy, sortOrder
 */
router.get(
  '/rooms',
  authenticate,
  [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be 1-100 characters'),
    query('type')
      .optional()
      .isIn(['Standard', 'Deluxe', 'Suite'])
      .withMessage('Invalid room type'),
    query('status')
      .optional()
      .isIn(['Available', 'Occupied', 'Cleaning', 'Maintenance'])
      .withMessage('Invalid room status'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be >= 0'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be >= 0'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be 1-100'),
    query('sortBy')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', 'ascending', 'descending'])
      .withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  searchRooms
);

/**
 * GET /api/search/users
 * Search users (admin/manager only)
 * Query: q, role, isActive, startDate, endDate, page, limit, sortBy, sortOrder
 */
router.get(
  '/users',
  authenticate,
  [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be 1-100 characters'),
    query('role')
      .optional()
      .isIn(['admin', 'manager', 'staff', 'receptionist', 'guest'])
      .withMessage('Invalid user role'),
    query('isActive')
      .optional()
      .isIn(['true', 'false', 'True', 'False'])
      .withMessage('isActive must be true or false'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be >= 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be 1-100'),
    query('sortBy')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', 'ascending', 'descending'])
      .withMessage('Sort order must be asc or desc')
  ],
  handleValidationErrors,
  searchUsers
);

/**
 * GET /api/search/suggest
 * Get type-ahead suggestions
 * Query: q, limit
 */
router.get(
  '/suggest',
  authenticate,
  [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be 1-100 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be 1-20')
  ],
  handleValidationErrors,
  getSuggestions
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

router.use((error, req, res, next) => {
  console.error('Search route error:', error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Search operation failed',
    ...(process.env.NODE_ENV === 'development' && { error: error.stack })
  });
});

module.exports = router;