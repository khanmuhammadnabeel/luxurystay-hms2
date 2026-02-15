import api from './api';

// -----------------------------------------------------------------------------
// Endpoints (hotel services: room service, laundry, spa, etc.)
// -----------------------------------------------------------------------------
const endpoints = {
  getAll: '/api/services',
  getById: (id) => `/api/services/${id}`,
  request: '/api/services/request',
  myRequests: '/api/services/my-requests',
  cancelRequest: (id) => `/api/services/requests/${id}`,
  updateStatus: (id) => `/api/services/requests/${id}/status`,
  getCategories: '/api/services/categories',
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
 * getServices(filters = {})
 * GET /api/services. Query: category, available, page, limit.
 * Returns { data: services[], pagination }.
 */
export async function getServices(filters = {}) {
  try {
    const params = buildParams({
      category: filters.category,
      available: filters.available,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.getAll, { params });
    return {
      data: response?.data ?? response?.services ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch services';
    throw new Error(message);
  }
}

/**
 * getServiceById(id)
 * GET /api/services/:id. Returns { success, data: service }.
 */
export async function getServiceById(id) {
  try {
    const response = await api.get(endpoints.getById(id));
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.service ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Service not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch service';
    throw new Error(message);
  }
}

/**
 * getServiceCategories()
 * GET /api/services/categories. Returns string[] (food, laundry, spa, etc.).
 */
export async function getServiceCategories() {
  try {
    const response = await api.get(endpoints.getCategories);
    const data = response?.data ?? response?.categories ?? response;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error?.response?.status === 404) {
      return [];
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch categories';
    throw new Error(message);
  }
}

/**
 * requestService(requestData)
 * POST /api/services/request. requestData: { serviceId, roomId, quantity, specialInstructions }.
 * Returns { success, data: serviceRequest }.
 */
export async function requestService(requestData) {
  try {
    const response = await api.post(endpoints.request, requestData);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.request ?? response?.serviceRequest ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to request service';
    throw new Error(message);
  }
}

/**
 * getMyServiceRequests(filters = {})
 * GET /api/services/my-requests. Query: status, page, limit.
 * Returns { data: requests[], pagination }.
 */
export async function getMyServiceRequests(filters = {}) {
  try {
    const params = buildParams({
      status: filters.status,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.myRequests, { params });
    return {
      data: response?.data ?? response?.requests ?? response?.serviceRequests ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch my service requests';
    throw new Error(message);
  }
}

/**
 * cancelServiceRequest(id)
 * DELETE /api/services/requests/:id. Returns { success, message }.
 */
export async function cancelServiceRequest(id) {
  try {
    const response = await api.delete(endpoints.cancelRequest(id));
    return {
      success: response?.success ?? true,
      message: response?.message ?? response?.msg ?? 'Request cancelled',
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Service request not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to cancel request';
    throw new Error(message);
  }
}

/**
 * updateRequestStatus(id, status, assignedTo)
 * PUT /api/services/requests/:id/status. Body: { status, assignedTo }.
 * status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'.
 * Returns { success, data: updatedRequest }.
 */
export async function updateRequestStatus(id, status, assignedTo) {
  try {
    const body = { status };
    if (assignedTo !== undefined && assignedTo !== null) {
      body.assignedTo = assignedTo;
    }
    const response = await api.put(endpoints.updateStatus(id), body);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.request ?? response?.updatedRequest ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    if (error?.response?.status === 404) {
      throw new Error('Service request not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update request status';
    throw new Error(message);
  }
}
