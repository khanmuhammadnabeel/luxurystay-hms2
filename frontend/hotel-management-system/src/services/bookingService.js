import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  getAll: '/api/bookings',
  getById: (id) => `/api/bookings/${id}`,
  create: '/api/bookings',
  update: (id) => `/api/bookings/${id}`,
  cancel: (id) => `/api/bookings/${id}`,
  myBookings: '/api/bookings/my',
  availability: (roomId) => `/api/rooms/${roomId}/availability`,
  invoice: (id) => `/api/bookings/${id}/invoice`,
};

/**
 * Build query params – omit empty/undefined values (reuse roomService pattern)
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
 * getBookings(filters = {})
 * GET /api/bookings. Query: page, limit, status, startDate, endDate.
 * Returns: { data: bookings[], pagination, total }
 */
export async function getBookings(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
    const response = await api.get(endpoints.getAll, { params });
    return {
      data: response?.data ?? response?.bookings ?? [],
      pagination: response?.pagination ?? null,
      total: response?.total ?? response?.data?.length ?? 0,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null, total: 0 };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch bookings';
    throw new Error(message);
  }
}

/**
 * getMyBookings(filters = {})
 * GET /api/bookings/my. Query: page, limit, status.
 * Returns: { data, pagination }
 */
export async function getMyBookings(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      status: filters.status,
    });
    const response = await api.get(endpoints.myBookings, { params });
    return {
      data: response?.data ?? response?.bookings ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch my bookings';
    throw new Error(message);
  }
}

/**
 * getBookingById(id)
 * GET /api/bookings/:id. Returns { success, data: booking }. Throws if 404.
 */
export async function getBookingById(id) {
  try {
    const response = await api.get(endpoints.getById(id));
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.booking ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Booking not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch booking';
    throw new Error(message);
  }
}

/**
 * createBooking(bookingData)
 * POST /api/bookings. bookingData: roomId, checkInDate, checkOutDate, guestName, numberOfGuests, specialRequests.
 * Returns: { success, data: booking }
 */
export async function createBooking(bookingData) {
  try {
    const response = await api.post(endpoints.create, bookingData);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.booking ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to create booking';
    throw new Error(message);
  }
}

/**
 * updateBooking(id, updates)
 * PUT /api/bookings/:id. updates: { status, numberOfGuests, specialRequests }.
 * Returns: { success, data: updatedBooking }
 */
export async function updateBooking(id, updates) {
  try {
    const response = await api.put(endpoints.update(id), updates);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.booking ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    if (error?.response?.status === 404) {
      throw new Error('Booking not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update booking';
    throw new Error(message);
  }
}

/**
 * cancelBooking(id)
 * DELETE /api/bookings/:id. Returns { success, message }
 */
export async function cancelBooking(id) {
  try {
    const response = await api.delete(endpoints.cancel(id));
    return {
      success: response?.success ?? true,
      message: response?.message ?? response?.msg ?? 'Booking cancelled',
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Booking not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to cancel booking';
    throw new Error(message);
  }
}

/**
 * checkRoomAvailability(roomId, checkInDate, checkOutDate)
 * GET /api/bookings/availability/:roomId. Query: checkInDate, checkOutDate.
 * Returns: { available: boolean, conflictingBookings?: [] }
 */
export async function checkRoomAvailability(roomId, checkIn, checkOut) {
  try {
    const params = { checkIn, checkOut };
    const response = await api.get(endpoints.availability(roomId), { params });
    return response.data || response;
  } catch (error) {
    if (error?.response?.status === 404) {
      return { available: false };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to check availability';
    throw new Error(message);
  }
}

/**
 * getBookingInvoice(id)
 * GET /api/bookings/:id/invoice. Returns { invoice: {} } or throws.
 */
export async function getBookingInvoice(id) {
  try {
    const response = await api.get(endpoints.invoice(id));
    return {
      invoice: response?.invoice ?? response?.data ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Invoice not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch invoice';
    throw new Error(message);
  }
}
// Export as a service object for centralized access
export const bookingService = {
  getBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  checkRoomAvailability,
  getBookingInvoice
};
