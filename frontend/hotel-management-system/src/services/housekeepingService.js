import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  getTasks: '/api/housekeeping/tasks',
  getTaskById: (id) => `/api/housekeeping/tasks/${id}`,
  createTask: '/api/housekeeping/tasks',
  updateTask: (id) => `/api/housekeeping/tasks/${id}`,
  deleteTask: (id) => `/api/housekeeping/tasks/${id}`,
  myTasks: '/api/housekeeping/my-tasks',
  getStats: '/api/housekeeping/stats',
  pendingVerification: '/api/housekeeping/pending-verification',
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
 * getTasks(filters = {})
 * GET /api/housekeeping/tasks. Query: status, priority, assignedTo, roomId, page, limit.
 * Returns { data: tasks[], pagination }.
 */
export async function getTasks(filters = {}) {
  try {
    const params = buildParams({
      status: filters.status,
      priority: filters.priority,
      assignedTo: filters.assignedTo,
      roomId: filters.roomId,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.getTasks, { params });
    return {
      data: response?.data ?? response?.tasks ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch tasks';
    throw new Error(message);
  }
}

/**
 * getTaskById(id)
 * GET /api/housekeeping/tasks/:id. Returns { success, data: task }.
 */
export async function getTaskById(id) {
  try {
    const response = await api.get(endpoints.getTaskById(id));
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.task ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Task not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch task';
    throw new Error(message);
  }
}

/**
 * getMyTasks(filters = {})
 * GET /api/housekeeping/my-tasks. Query: status, page, limit.
 * Returns { data: tasks[], pagination }.
 */
export async function getMyTasks(filters = {}) {
  try {
    const params = buildParams({
      status: filters.status,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.myTasks, { params });
    return {
      data: response?.data ?? response?.tasks ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch my tasks';
    throw new Error(message);
  }
}

/**
 * createTask(taskData)
 * POST /api/housekeeping/tasks. taskData: { roomId, assignedTo, taskType, priority, notes, scheduledDate }.
 * Returns { success, data: task }.
 */
export async function createTask(taskData) {
  try {
    const response = await api.post(endpoints.createTask, taskData);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.task ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to create task';
    throw new Error(message);
  }
}

/**
 * updateTask(id, updates)
 * PUT /api/housekeeping/tasks/:id. updates: { status, priority, notes, verifiedBy }.
 * Returns { success, data: updatedTask }.
 */
export async function updateTask(id, updates) {
  try {
    const response = await api.put(endpoints.updateTask(id), updates);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.task ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    if (error?.response?.status === 404) {
      throw new Error('Task not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update task';
    throw new Error(message);
  }
}

/**
 * deleteTask(id) – admin only
 * DELETE /api/housekeeping/tasks/:id. Returns { success, message }.
 */
export async function deleteTask(id) {
  try {
    const response = await api.delete(endpoints.deleteTask(id));
    return {
      success: response?.success ?? true,
      message: response?.message ?? response?.msg ?? 'Task deleted',
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Task not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to delete task';
    throw new Error(message);
  }
}

/**
 * getHousekeepingStats()
 * GET /api/housekeeping/stats. Returns { total, byStatus, byPriority, urgent }.
 */
export async function getHousekeepingStats() {
  try {
    const response = await api.get(endpoints.getStats);
    return {
      total: response?.total ?? 0,
      byStatus: response?.byStatus ?? response?.status ?? {},
      byPriority: response?.byPriority ?? response?.priority ?? {},
      urgent: response?.urgent ?? response?.urgentCount ?? 0,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { total: 0, byStatus: {}, byPriority: {}, urgent: 0 };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch stats';
    throw new Error(message);
  }
}

/**
 * getPendingVerification(filters = {})
 * GET /api/housekeeping/pending-verification. Query: page, limit.
 * Returns { data: tasks[], pagination }.
 */
export async function getPendingVerification(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
    });
    const response = await api.get(endpoints.pendingVerification, { params });
    return {
      data: response?.data ?? response?.tasks ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch pending verification';
    throw new Error(message);
  }
}
