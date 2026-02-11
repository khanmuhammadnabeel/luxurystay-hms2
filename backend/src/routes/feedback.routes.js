const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

/**
 * POST /api/feedback
 * Guest submits a review after stay
 * Access: Private (guest only)
 */
router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('bookingId is required'),
    body('roomId').notEmpty().withMessage('roomId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('reviewTitle').notEmpty().trim().withMessage('Review title is required')
  ],
  handleValidation,
  feedbackController.submitFeedback
);

/**
 * POST /api/feedback/complaints
 * Guest reports an issue during stay
 * Access: Private (guest only)
 */
router.post(
  '/complaints',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('bookingId is required'),
    body('roomId').notEmpty().withMessage('roomId is required'),
    body('category')
      .isIn(['noise', 'cleanliness', 'maintenance', 'service', 'billing', 'other'])
      .withMessage('Invalid category'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('description').notEmpty().withMessage('Description is required')
  ],
  handleValidation,
  feedbackController.submitComplaint
);

/**
 * GET /api/feedback/my-reviews
 * Get current user's reviews
 * Access: Private (guest only)
 */
router.get('/my-reviews', authenticate, feedbackController.getMyFeedback);

/**
 * GET /api/feedback/my-complaints
 * Get current user's complaints
 * Access: Private (guest only)
 */
router.get('/my-complaints', authenticate, feedbackController.getMyComplaints);

/**
 * GET /api/feedback/rooms/:roomId
 * Public endpoint - approved, public reviews for a room
 */
router.get('/rooms/:roomId', [param('roomId').isMongoId().withMessage('Invalid room ID'), handleValidation], feedbackController.getRoomReviews);

/**
 * POST /api/feedback/responses
 * Staff/admin responds to feedback or complaint
 * Access: Private (admin, manager, receptionist)
 */
router.post(
  '/responses',
  authenticate,
  authorize('admin', 'manager', 'receptionist'),
  [body('responseText').notEmpty().trim().withMessage('Response text is required')],
  handleValidation,
  feedbackController.respondToFeedback
);

/**
 * PUT /api/feedback/complaints/:id/status
 * Staff/admin updates complaint status
 * Access: Private (admin, manager, receptionist)
 */
router.put(
  '/complaints/:id/status',
  authenticate,
  authorize('admin', 'manager', 'receptionist'),
  [
    param('id').isMongoId().withMessage('Invalid complaint ID'),
    body('status')
      .isIn(['submitted', 'acknowledged', 'investigating', 'resolved', 'closed'])
      .withMessage('Invalid status')
  ],
  handleValidation,
  feedbackController.updateComplaintStatus
);

/**
 * GET /api/feedback/complaints/pending
 * Admin/Manager only - get unresolved complaints
 * Access: Private (admin, manager)
 */
router.get(
  '/complaints/pending',
  authenticate,
  authorize('admin', 'manager'),
  feedbackController.getPendingComplaints
);

/**
 * GET /api/feedback/stats
 * Admin/Manager only - feedback analytics
 * Access: Private (admin, manager)
 */
router.get('/stats', authenticate, authorize('admin', 'manager'), feedbackController.getFeedbackStats);

module.exports = router;
