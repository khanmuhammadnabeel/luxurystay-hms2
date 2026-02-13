/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations
 */

/**
 * @swagger
 * /api/admin/overview:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get system overview
 *     description: Dashboard statistics (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System overview
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
 *                     totalBookings:
 *                       type: integer
 *                     activeGuests:
 *                       type: integer
 *                     revenueToday:
 *                       type: number
 *                     totalRooms:
 *                       type: integer
 *                     occupiedRooms:
 *                       type: integer
 *                     occupancyRate:
 *                       type: number
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users
 *     description: List users with pagination and filters (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: [admin, manager, staff, receptionist, guest]
 *       - name: isActive
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved
 */

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update user role
 *     description: Change user role (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, manager, staff, receptionist, guest]
 *     responses:
 *       200:
 *         description: Role updated
 */

/**
 * @swagger
 * /api/admin/financial:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get financial overview
 *     description: Revenue, payments, trends (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Financial data
 */

/**
 * @swagger
 * /api/admin/rooms:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new room
 *     description: Add room to inventory (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Room created
 */

/**
 * @swagger
 * /api/admin/rooms/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update room
 *     description: Modify room details (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Room updated
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete room
 *     description: Remove room from inventory (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Room deleted
 */

/**
 * @swagger
 * /api/admin/staff-performance:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get staff performance metrics
 *     description: Housekeeping and service staff stats (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Performance data
 */

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get system logs
 *     description: Audit logs for all activities (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: System logs
 */

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