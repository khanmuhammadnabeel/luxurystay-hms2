import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  getAll: '/api/feedback',
  getById: (id) => `/api/feedback/${id}`,
  create: '/api/feedback',
  myFeedback: '/api/feedback/my',
  roomReviews: (roomId) => `/api/feedback/rooms/${roomId}`,
  updateStatus: (id) => `/api/feedback/${id}/status`,
};

/**
 * Build query params – omit empty/undefined values
 */
function buildParams(params) {
  const result = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = Array.isArray(value) ? value.join(',') : value;
    }
  }
  return result;
}

/**
 * getFeedback(filters = {}) – admin/staff only
 * GET /api/feedback. Query: page, limit, rating, status.
 * Returns { data: feedback[], pagination }.
 */
export async function getFeedback(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      rating: filters.rating,
      status: filters.status,
    });
    const response = await api.get(endpoints.getAll, { params });
    return {
      data: response?.data ?? response?.feedback ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch feedback';
    throw new Error(message);
  }
}

/**
 * getMyFeedback(filters = {})
 * GET /api/feedback/my. Query: page, limit, status.
 * Returns { data, pagination }.
 */
export async function getMyFeedback(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      status: filters.status,
    });
    const response = await api.get(endpoints.myFeedback, { params });
    return {
      data: response?.data ?? response?.feedback ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch my feedback';
    throw new Error(message);
  }
}

/**
 * getFeedbackById(id)
 * GET /api/feedback/:id. Returns { success, data: feedback }.
 */
export async function getFeedbackById(id) {
  try {
    const response = await api.get(endpoints.getById(id));
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.feedback ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Feedback not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch feedback';
    throw new Error(message);
  }
}

/**
 * getRoomReviews(roomId, filters = {})
 * GET /api/feedback/rooms/:roomId. Query: page, limit, sortBy.
 * Returns { data: reviews[], averageRating, total }.
 */
export async function getRoomReviews(roomId, filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
    });
    const response = await api.get(endpoints.roomReviews(roomId), { params });
    return {
      data: response?.data ?? response?.reviews ?? response?.feedback ?? [],
      averageRating: response?.averageRating ?? response?.avgRating ?? null,
      total: response?.total ?? response?.data?.length ?? 0,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], averageRating: null, total: 0 };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch room reviews';
    throw new Error(message);
  }
}

/**
 * submitFeedback(feedbackData)
 * POST /api/feedback. feedbackData: { bookingId, rating, title, comment, isPublic }.
 * Returns { success, data: feedback }.
 */
export async function submitFeedback(feedbackData) {
  try {
    const response = await api.post(endpoints.create, feedbackData);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.feedback ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to submit feedback';
    throw new Error(message);
  }
}

/**
 * updateFeedbackStatus(id, status)
 * PUT /api/feedback/:id/status. status: 'pending' | 'approved' | 'rejected'.
 * Returns { success, data: updatedFeedback }.
 */
export async function updateFeedbackStatus(id, status) {
  try {
    const response = await api.put(endpoints.updateStatus(id), { status });
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.feedback ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    if (error?.response?.status === 404) {
      throw new Error('Feedback not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update feedback status';
    throw new Error(message);
  }
}
