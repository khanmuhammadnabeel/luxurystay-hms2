import api from './api';

// -----------------------------------------------------------------------------
// Endpoints (admin only)
// -----------------------------------------------------------------------------
const endpoints = {
  dashboard: '/api/admin/overview',
  users: '/api/admin/users',
  updateUserRole: (id) => `/api/admin/users/${id}/role`,
  financial: '/api/admin/financial',
  rooms: '/api/admin/rooms',
  updateRoom: (id) => `/api/admin/rooms/${id}`,
  staffPerformance: '/api/admin/staff-performance',
  logs: '/api/admin/logs',
  systemSettings: '/api/admin/settings',
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
 * getDashboardStats()
 * GET /api/admin/overview. Returns dashboard stats.
 */
export async function getDashboardStats() {
  try {
    const response = await api.get(endpoints.dashboard);
    return {
      totalBookings: response?.totalBookings ?? 0,
      activeGuests: response?.activeGuests ?? 0,
      revenueToday: response?.revenueToday ?? 0,
      totalRooms: response?.totalRooms ?? 0,
      occupiedRooms: response?.occupiedRooms ?? 0,
      occupancyRate: response?.occupancyRate ?? 0,
      pendingRequests: response?.pendingRequests ?? 0,
      usersByRole: response?.usersByRole ?? {},
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return {
        totalBookings: 0,
        activeGuests: 0,
        revenueToday: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        occupancyRate: 0,
        pendingRequests: 0,
        usersByRole: {},
      };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch dashboard stats';
    throw new Error(message);
  }
}

/**
 * getUsers(filters = {})
 * GET /api/admin/users. Query: page, limit, role, isActive, search.
 * Returns { data: users[], pagination }.
 */
export async function getUsers(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      role: filters.role,
      isActive: filters.isActive,
      search: filters.search,
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
      'Failed to fetch users';
    throw new Error(message);
  }
}

/**
 * updateUserRole(userId, role)
 * PUT /api/admin/users/:id/role. Body: { role }.
 * Returns { success, data: updatedUser }.
 */
export async function updateUserRole(userId, role) {
  try {
    const response = await api.put(endpoints.updateUserRole(userId), { role });
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.user ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    if (error?.response?.status === 404) {
      throw new Error('User not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update user role';
    throw new Error(message);
  }
}

/**
 * getFinancialOverview(filters = {})
 * GET /api/admin/financial. Query: startDate, endDate, period.
 * Returns { revenue, payments, trends, breakdown }.
 */
export async function getFinancialOverview(filters = {}) {
  try {
    const params = buildParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      period: filters.period,
    });
    const response = await api.get(endpoints.financial, { params });
    return {
      revenue: response?.revenue ?? 0,
      payments: response?.payments ?? [],
      trends: response?.trends ?? [],
      breakdown: response?.breakdown ?? {},
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { revenue: 0, payments: [], trends: [], breakdown: {} };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch financial overview';
    throw new Error(message);
  }
}

/**
 * createRoom(roomData)
 * POST /api/admin/rooms. roomData: { roomNumber, type, price, status, description, amenities }.
 * Returns { success, data: room }.
 */
export async function createRoom(roomData) {
  try {
    const response = await api.post(endpoints.rooms, roomData);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.room ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to create room';
    throw new Error(message);
  }
}

/**
 * updateRoom(id, roomData)
 * PUT /api/admin/rooms/:id. roomData: { roomNumber, type, price, status, description, amenities }.
 * Returns { success, data: updatedRoom }.
 */
export async function updateRoom(id, roomData) {
  try {
    const response = await api.put(endpoints.updateRoom(id), roomData);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.room ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    if (error?.response?.status === 404) {
      throw new Error('Room not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update room';
    throw new Error(message);
  }
}

/**
 * deleteRoom(id)
 * DELETE /api/admin/rooms/:id. Returns { success, message }.
 */
export async function deleteRoom(id) {
  try {
    const response = await api.delete(endpoints.updateRoom(id));
    return {
      success: response?.success ?? true,
      message: response?.message ?? response?.msg ?? 'Room deleted',
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Room not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to delete room';
    throw new Error(message);
  }
}

/**
 * getStaffPerformance()
 * GET /api/admin/staff-performance. Returns { housekeepingStaff, serviceStaff }.
 */
export async function getStaffPerformance() {
  try {
    const response = await api.get(endpoints.staffPerformance);
    return {
      housekeepingStaff: response?.housekeepingStaff ?? response?.housekeeping ?? [],
      serviceStaff: response?.serviceStaff ?? response?.service ?? [],
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { housekeepingStaff: [], serviceStaff: [] };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch staff performance';
    throw new Error(message);
  }
}

/**
 * getSystemLogs(limit = 50)
 * GET /api/admin/logs. Query: { limit }.
 * Returns { data: logs[], totalLogs }.
 */
export async function getSystemLogs(limit = 50) {
  try {
    const params = buildParams({ limit });
    const response = await api.get(endpoints.logs, { params });
    return {
      data: response?.data ?? response?.logs ?? [],
      totalLogs: response?.totalLogs ?? response?.total ?? response?.data?.length ?? 0,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], totalLogs: 0 };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch logs';
    throw new Error(message);
  }
}

/**
 * updateSystemSettings(settings)
 * PUT /api/admin/settings. Returns { success, data: settings }.
 */
export async function updateSystemSettings(settings) {
  try {
    const response = await api.put(endpoints.systemSettings, settings);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.settings ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    if (error?.response?.status === 404) {
      throw new Error('Settings not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update settings';
    throw new Error(message);
  }
}
