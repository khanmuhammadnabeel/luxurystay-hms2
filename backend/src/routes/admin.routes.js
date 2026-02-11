const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// ==========================================
// ADMIN DASHBOARD ROUTES
// ALL routes require authentication and admin role
// ==========================================

/**
 * @route   GET /api/admin/overview
 * @desc    Get system dashboard overview
 * @access  Private (Admin only)
 */
router.get(
  '/overview',
  authenticate,
  authorize('admin'),
  adminController.getSystemOverview
);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering & pagination
 * @access  Private (Admin only)
 * @query   {string} role - Filter by role
 * @query   {boolean} isActive - Filter by active status
 * @query   {string} search - Search by name/email
 * @query   {number} page - Page number
 * @query   {number} limit - Items per page
 */
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  [
    query('role').optional().isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'guest']),
    query('isActive').optional().isBoolean(),
    query('search').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  adminController.getAllUsers
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 * @param   {string} id - User ID
 * @body    {string} role - New role
 */
router.put(
  '/users/:id/role',
  authenticate,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role')
      .isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'guest'])
      .withMessage('Invalid role. Must be one of: admin, manager, receptionist, housekeeping, guest')
  ],
  adminController.updateUserRole
);

/**
 * @route   GET /api/admin/financial
 * @desc    Get financial overview and trends
 * @access  Private (Admin only)
 */
router.get(
  '/financial',
  authenticate,
  authorize('admin'),
  adminController.getFinancialOverview
);

/**
 * @route   POST /api/admin/rooms
 * @desc    Create new room
 * @access  Private (Admin only)
 * @body    {string} roomNumber - Room number (required)
 * @body    {string} type - Room type (Standard/Deluxe/Suite)
 * @body    {number} price - Room price per night
 * @body    {string} status - Room status
 * @body    {string} description - Room description
 * @body    {array} amenities - Room amenities
 */
router.post(
  '/rooms',
  authenticate,
  authorize('admin'),
  [
    body('roomNumber').notEmpty().withMessage('Room number is required'),
    body('type').optional().isIn(['Standard', 'Deluxe', 'Suite']).withMessage('Invalid room type'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('status').optional().isIn(['Available', 'Occupied', 'Cleaning', 'Maintenance']).withMessage('Invalid status'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array')
  ],
  adminController.manageRoom
);

/**
 * @route   PUT /api/admin/rooms/:id
 * @desc    Update existing room
 * @access  Private (Admin only)
 * @param   {string} id - Room ID
 * @body    {string} roomNumber - Room number
 * @body    {string} type - Room type
 * @body    {number} price - Room price per night
 * @body    {string} status - Room status
 * @body    {string} description - Room description
 * @body    {array} amenities - Room amenities
 */
router.put(
  '/rooms/:id',
  authenticate,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid room ID'),
    body('roomNumber').optional().notEmpty().withMessage('Room number cannot be empty'),
    body('type').optional().isIn(['Standard', 'Deluxe', 'Suite']).withMessage('Invalid room type'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('status').optional().isIn(['Available', 'Occupied', 'Cleaning', 'Maintenance']).withMessage('Invalid status'),
    body('amenities').optional().isArray().withMessage('Amenities must be an array')
  ],
  adminController.manageRoom
);

/**
 * @route   GET /api/admin/staff-performance
 * @desc    Get staff performance metrics
 * @access  Private (Admin only)
 */
router.get(
  '/staff-performance',
  authenticate,
  authorize('admin'),
  adminController.getStaffPerformance
);

/**
 * @route   GET /api/admin/logs
 * @desc    Get system activity logs
 * @access  Private (Admin only)
 * @query   {number} limit - Number of logs to return
 */
router.get(
  '/logs',
  authenticate,
  authorize('admin'),
  [
    query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be between 1-200')
  ],
  adminController.getSystemLogs
);

module.exports = router;