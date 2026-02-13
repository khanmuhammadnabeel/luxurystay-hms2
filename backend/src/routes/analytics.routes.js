/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get dashboard statistics
 *     description: Retrieve occupancy, revenue, and other metrics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
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
 *                     occupancyRate:
 *                       type: number
 *                     revenue:
 *                       type: number
 *                     totalGuests:
 *                       type: integer
 */

// Your existing analytics routes code below...

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics endpoints require admin or manager role

// GET comprehensive dashboard statistics
router.get('/dashboard', authenticate, authorize('admin', 'manager'), analyticsController.getDashboardStats);

// GET occupancy report for date range
router.get('/occupancy', authenticate, authorize('admin', 'manager'), analyticsController.getOccupancyReport);

// GET guest demographics analytics
router.get('/guests', authenticate, authorize('admin', 'manager'), analyticsController.getGuestAnalytics);

// GET service usage analytics
router.get('/services', authenticate, authorize('admin', 'manager'), analyticsController.getServiceAnalytics);

// GET booking trends
router.get('/trends', authenticate, authorize('admin', 'manager'), analyticsController.getBookingTrends);

module.exports = router;
