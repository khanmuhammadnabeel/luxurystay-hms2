import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  getAll: '/api/rooms',
  getById: (id) => `/api/rooms/${id}`,
  checkAvailability: '/api/rooms/availability',
  getTypes: '/api/rooms/types',
  getAmenities: '/api/rooms/amenities',
};

/**
 * Build query params from filters – omit empty/undefined values
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
 * getRooms(filters = {})
 * GET /api/rooms. Query: page, limit, type, status, minPrice, maxPrice, amenities.
 * Returns: { data: rooms[], pagination, success }
 */
export async function getRooms(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      type: filters.type,
      status: filters.status,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      amenities: filters.amenities,
    });
    const response = await api.get(endpoints.getAll, { params });
    return {
      data: response?.data ?? response?.rooms ?? [],
      pagination: response?.pagination ?? null,
      total: response?.total ?? 0,
      success: response?.success ?? true,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null, success: true };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch rooms';
    throw new Error(message);
  }
}

/**
 * getRoomById(id)
 * GET /api/rooms/:id. Returns { success, data: room }. Throws if 404.
 */
export async function getRoomById(id) {
  try {
    const response = await api.get(endpoints.getById(id));
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.room ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Room not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch room';
    throw new Error(message);
  }
}

/**
 * checkAvailability(checkInDate, checkOutDate, roomType)
 * GET /api/rooms/availability. Query: checkInDate, checkOutDate, roomType.
 * Returns: { available: boolean, rooms: [] }
 */
export async function checkAvailability(checkInDate, checkOutDate, roomType) {
  try {
    const params = buildParams({
      checkInDate,
      checkOutDate,
      roomType,
    });
    const response = await api.get(endpoints.checkAvailability, { params });
    return {
      available: response?.available ?? false,
      rooms: response?.rooms ?? response?.data ?? [],
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { available: false, rooms: [] };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to check availability';
    throw new Error(message);
  }
}

/**
 * getRoomTypes()
 * GET /api/rooms/types. Returns string[] (e.g. Standard, Deluxe, Suite).
 */
export async function getRoomTypes() {
  try {
    const response = await api.get(endpoints.getTypes);
    const data = response?.data ?? response?.types ?? response;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error?.response?.status === 404) {
      return [];
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch room types';
    throw new Error(message);
  }
}

/**
 * getAmenitiesList()
 * GET /api/rooms/amenities. Returns string[] of amenities.
 */
export async function getAmenitiesList() {
  try {
    const response = await api.get(endpoints.getAmenities);
    const data = response?.data ?? response?.amenities ?? response;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error?.response?.status === 404) {
      return [];
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch amenities';
    throw new Error(message);
  }
}

/**
 * searchRooms(query, filters)
 * GET /api/rooms with q and filters. Returns { data, pagination }.
 */
export async function searchRooms(query, filters = {}) {
  try {
    const params = buildParams({
      q: query,
      ...filters,
    });
    const response = await api.get(endpoints.getAll, { params });
    return {
      data: response?.data ?? response?.rooms ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Search failed';
    throw new Error(message);
  }
}
