const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const FeedbackResponse = require('../models/FeedbackResponse');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const socketHelper = require('../utils/socketHelper');

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 10;

/**
 * POST /api/feedback
 * Guest submits review after stay
 */
exports.submitFeedback = asyncHandler(async (req, res) => {
  try {
    const guestId = req.user.userId;
    const { bookingId, roomId, rating, reviewTitle, reviewText, categories = {}, isPublic = true } = req.body;

    // Basic validation
    if (!bookingId || !roomId || !rating || !reviewTitle || !reviewText) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify booking belongs to guest and is checked-out
    const booking = await Booking.findOne({ _id: bookingId, guestId });
    if (!booking) {
      return res.status(400).json({ success: false, message: 'Booking not found for this guest' });
    }

    if (booking.status !== 'checked-out') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted after checkout' });
    }

    // Optionally ensure room matches booking
    if (String(booking.roomId) !== String(roomId)) {
      return res.status(400).json({ success: false, message: 'Provided room does not match booking' });
    }

    const newFeedback = new Feedback({
      guestId,
      bookingId,
      roomId,
      rating,
      reviewTitle,
      reviewText,
      categories,
      isPublic,
      status: 'pending'
    });

    await newFeedback.save();

    // Emit socket event to admins
    const io = socketHelper.getIO();
    if (io) io.to('admins').emit('feedback_submitted', { 
      feedbackId: newFeedback._id, 
      roomId, 
      guestId, 
      timestamp: new Date().toISOString() 
    });

    res.status(201).json({ 
      success: true, 
      data: newFeedback, 
      message: 'Feedback submitted and awaiting approval' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/feedback/complaints
 * Guest reports issue during stay
 */
exports.submitComplaint = asyncHandler(async (req, res) => {
  try {
    const guestId = req.user.userId;
    const { bookingId, roomId, category, subject, description, attachments = [] } = req.body;

    if (!bookingId || !roomId || !category || !subject || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify booking belongs to guest and is checked-in
    const booking = await Booking.findOne({ _id: bookingId, guestId });
    if (!booking) {
      return res.status(400).json({ success: false, message: 'Booking not found for this guest' });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({ success: false, message: 'Complaints can only be submitted during stay (checked-in)' });
    }

    // Auto-set priority based on category
    const priorityMap = {
      noise: 'medium',
      cleanliness: 'medium',
      maintenance: 'high',
      service: 'medium',
      billing: 'urgent',
      other: 'medium'
    };

    const priority = priorityMap[category] || 'medium';

    const complaint = new Complaint({
      guestId,
      bookingId,
      roomId,
      category,
      priority,
      subject,
      description,
      attachments,
      status: 'submitted'
    });

    await complaint.save();

    // Emit socket event
    const io = socketHelper.getIO();
    if (io) io.to('admins').emit('complaint_submitted', { 
      complaintId: complaint._id, 
      roomId, 
      guestId, 
      priority, 
      timestamp: new Date().toISOString() 
    });

    res.status(201).json({ 
      success: true, 
      data: complaint, 
      message: 'Complaint submitted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/feedback/my-reviews
 * Get current user's reviews
 */
exports.getMyFeedback = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = req.query;

    const filter = { guestId: userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reviews = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('roomId', 'roomNumber type')
      .lean();

    const total = await Feedback.countDocuments(filter);

    res.json({ 
      success: true, 
      data: reviews, 
      pagination: { 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / parseInt(limit)) 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/feedback/my-complaints
 * Get current user's complaints
 */
exports.getMyComplaints = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, priority, page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = req.query;

    const filter = { guestId: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('roomId', 'roomNumber type')
      .populate({ path: 'assignedTo', select: 'name email' })
      .lean();

    // Attach responses for each complaint
    const complaintIds = complaints.map(c => c._id);
    const responses = await FeedbackResponse.find({ complaintId: { $in: complaintIds } })
      .populate('staffId', 'name email')
      .lean();

    const complaintsWithResponses = complaints.map(c => ({
      ...c,
      responses: responses.filter(r => String(r.complaintId) === String(c._id))
    }));

    const total = await Complaint.countDocuments(filter);

    res.json({ 
      success: true, 
      data: complaintsWithResponses, 
      pagination: { 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / parseInt(limit)) 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/feedback/rooms/:roomId
 * Public: get approved, public reviews for a room with average
 */
exports.getRoomReviews = asyncHandler(async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = req.query;

    const filter = { roomId, status: 'approved', isPublic: true };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('guestId', 'name')
      .lean();

    const total = await Feedback.countDocuments(filter);
    const avg = await Feedback.getAverageRating(roomId);

    res.json({ 
      success: true, 
      data: { 
        reviews, 
        average: avg, 
        pagination: { 
          total, 
          page: parseInt(page), 
          limit: parseInt(limit), 
          pages: Math.ceil(total / parseInt(limit)) 
        } 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/feedback/responses
 * Staff/admin responds to feedback or complaint
 */
exports.respondToFeedback = asyncHandler(async (req, res) => {
  try {
    const staffId = req.user.userId;
    const userRole = req.user.role;
    
    // Authorization check
    if (!['admin', 'manager', 'receptionist'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions. Staff access required.' 
      });
    }
    
    const { feedbackId = null, complaintId = null, responseText, isPublic = true } = req.body;

    if ((!feedbackId && !complaintId) || (feedbackId && complaintId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Provide either feedbackId or complaintId (not both)' 
      });
    }

    // Validate referenced document exists
    if (feedbackId) {
      const target = await Feedback.findById(feedbackId);
      if (!target) return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    if (complaintId) {
      const target = await Complaint.findById(complaintId);
      if (!target) return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found' 
      });
    }

    const response = new FeedbackResponse({ 
      feedbackId, 
      complaintId, 
      staffId, 
      responseText, 
      isPublic 
    });
    
    await response.save();

    // Emit socket event
    const io = socketHelper.getIO();
    if (io) io.to('admins').emit('response_added', { 
      responseId: response._id, 
      feedbackId, 
      complaintId, 
      staffId, 
      timestamp: new Date().toISOString() 
    });

    res.status(201).json({ 
      success: true, 
      data: response, 
      message: 'Response recorded successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/feedback/complaints/:id/status
 * Staff/admin updates complaint status
 */
exports.updateComplaintStatus = asyncHandler(async (req, res) => {
  try {
    const staffId = req.user.userId;
    const userRole = req.user.role;
    
    // Authorization check
    if (!['admin', 'manager', 'receptionist'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions. Staff access required.' 
      });
    }
    
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ 
      success: false, 
      message: 'Status is required' 
    });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ 
      success: false, 
      message: 'Complaint not found' 
    });

    // Validate status transitions
    const allowed = {
      submitted: ['acknowledged', 'investigating', 'resolved', 'closed'],
      acknowledged: ['investigating', 'resolved', 'closed'],
      investigating: ['resolved', 'closed'],
      resolved: ['closed'],
      closed: []
    };

    const current = complaint.status;
    if (!allowed[current] || !allowed[current].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status transition from ${current} to ${status}` 
      });
    }

    complaint.status = status;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    complaint.updatedAt = new Date();
    await complaint.save();

    const io = socketHelper.getIO();
    if (io) io.to('admins').emit('complaint_updated', { 
      complaintId: complaint._id, 
      status, 
      staffId, 
      timestamp: new Date().toISOString() 
    });

    res.json({ 
      success: true, 
      data: complaint, 
      message: 'Complaint status updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/feedback/complaints/pending
 * Admin only - get unresolved complaints
 */
exports.getPendingComplaints = asyncHandler(async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Authorization check
    if (!['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions. Admin/Manager access required.' 
      });
    }
    
    const { page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = req.query;
    const filter = { status: { $in: ['submitted', 'acknowledged', 'investigating'] } };

    const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('guestId', 'name email')
      .populate('roomId', 'roomNumber')
      .lean();

    // Sort by priority locally to ensure urgent first
    complaints.sort((a, b) => 
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99)
    );

    const total = await Complaint.countDocuments(filter);

    res.json({ 
      success: true, 
      data: complaints, 
      pagination: { 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / parseInt(limit)) 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/feedback/stats
 * Admin only - feedback analytics
 */
exports.getFeedbackStats = asyncHandler(async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Authorization check
    if (!['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions. Admin/Manager access required.' 
      });
    }
    
    // Average rating across approved reviews
    const avgAgg = await Feedback.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);

    const avgRating = avgAgg && avgAgg.length ? parseFloat(avgAgg[0].avgRating.toFixed(2)) : null;
    const totalReviews = avgAgg && avgAgg.length ? avgAgg[0].totalReviews : 0;

    const pendingCount = await Feedback.countDocuments({ status: 'pending' });

    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ 
      success: true, 
      data: { 
        avgRating, 
        totalReviews, 
        pendingCount, 
        complaintsByCategory 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});