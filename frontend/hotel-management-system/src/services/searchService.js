import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  global: '/api/search/global',
  suggestions: '/api/search/suggest',
  bookings: '/api/search/bookings',
  rooms: '/api/search/rooms',
  users: '/api/search/users',
  advanced: '/api/search/advanced',
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
 * globalSearch(query, filters = {})
 * GET /api/search/global. Query: q, page, limit, sortBy, sortOrder, ...filters.
 * Returns { data: { bookings, rooms, users, invoices, services }, pagination }.
 */
export async function globalSearch(query, filters = {}) {
  try {
    const params = buildParams({
      q: query,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      ...filters,
    });
    const response = await api.get(endpoints.global, { params });
    const data = response?.data ?? response;
    return {
      data: {
        bookings: data?.bookings ?? [],
        rooms: data?.rooms ?? [],
        users: data?.users ?? [],
        invoices: data?.invoices ?? [],
        services: data?.services ?? [],
      },
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return {
        data: {
          bookings: [],
          rooms: [],
          users: [],
          invoices: [],
          services: [],
        },
        pagination: null,
      };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Search failed';
    throw new Error(message);
  }
}

/**
 * getSearchSuggestions(query, limit = 5)
 * GET /api/search/suggest. Query: q, limit.
 * Returns { data: suggestions[] }.
 */
export async function getSearchSuggestions(query, limit = 5) {
  try {
    const params = buildParams({ q: query, limit });
    const response = await api.get(endpoints.suggestions, { params });
    const data = response?.data ?? response?.suggestions ?? response;
    return {
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [] };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to get suggestions';
    throw new Error(message);
  }
}

/**
 * searchBookings(query, filters = {})
 * GET /api/search/bookings. Query: q, status, startDate, endDate, guestName, roomNumber, page, limit.
 * Returns { data: bookings[], pagination }.
 */
export async function searchBookings(query, filters = {}) {
  try {
    const params = buildParams({
      q: query,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
      guestName: filters.guestName,
      roomNumber: filters.roomNumber,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.bookings, { params });
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
      'Failed to search bookings';
    throw new Error(message);
  }
}

/**
 * searchRooms(query, filters = {})
 * GET /api/search/rooms. Query: q, type, status, minPrice, maxPrice, amenities, page, limit.
 * Returns { data: rooms[], pagination }.
 */
export async function searchRooms(query, filters = {}) {
  try {
    const params = buildParams({
      q: query,
      type: filters.type,
      status: filters.status,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      amenities: filters.amenities,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.rooms, { params });
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
      'Failed to search rooms';
    throw new Error(message);
  }
}

/**
 * searchUsers(query, filters = {}) – admin only
 * GET /api/search/users. Query: q, role, isActive, page, limit.
 * Returns { data: users[], pagination }.
 */
export async function searchUsers(query, filters = {}) {
  try {
    const params = buildParams({
      q: query,
      role: filters.role,
      isActive: filters.isActive,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.users, { params });
    return {
      data: response?.data ?? response?.users ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to search users';
    throw new Error(message);
  }
}

/**
 * advancedSearch(searchParams)
 * POST /api/search/advanced. Body: { searchTerm, filters, dateRange, priceRange, etc. }.
 * Returns { data: results[], pagination }.
 */
export async function advancedSearch(searchParams) {
  try {
    const response = await api.post(endpoints.advanced, searchParams);
    return {
      data: response?.data ?? response?.results ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Advanced search failed';
    throw new Error(message);
  }
}
