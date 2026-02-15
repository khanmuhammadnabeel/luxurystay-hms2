import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  profile: '/api/users/profile',
  updateProfile: '/api/users/profile',
  changePassword: '/api/users/change-password',
  uploadAvatar: '/api/users/avatar',
  getAll: '/api/users',
  getById: (id) => `/api/users/${id}`,
  updateUser: (id) => `/api/users/${id}`,
  deleteUser: (id) => `/api/users/${id}`,
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
 * getProfile()
 * GET /api/users/profile. Returns { success, data: user }.
 */
export async function getProfile() {
  try {
    const response = await api.get(endpoints.profile);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.user ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Profile not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch profile';
    throw new Error(message);
  }
}

/**
 * updateProfile(userData)
 * PUT /api/users/profile. userData: { name, phone, address, preferences? }.
 * Returns { success, data: updatedUser }.
 */
export async function updateProfile(userData) {
  try {
    const response = await api.put(endpoints.updateProfile, userData);
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.user ?? response,
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to update profile';
    throw new Error(message);
  }
}

/**
 * changePassword(currentPassword, newPassword)
 * POST /api/users/change-password. Body: { currentPassword, newPassword }.
 * Returns { success, message }.
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await api.post(endpoints.changePassword, {
      currentPassword,
      newPassword,
    });
    return {
      success: response?.success ?? true,
      message: response?.message ?? response?.msg ?? 'Password updated',
    };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to change password';
    throw new Error(message);
  }
}

/**
 * uploadAvatar(file)
 * POST /api/users/avatar. FormData: { avatar: file }.
 * Returns { success, avatarUrl }.
 */
export async function uploadAvatar(file) {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post(endpoints.uploadAvatar, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      success: response?.success ?? true,
      avatarUrl: response?.avatarUrl ?? response?.data?.avatarUrl ?? response?.url,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to upload avatar';
    throw new Error(message);
  }
}

/**
 * getAllUsers(filters = {}) – admin only
 * GET /api/users. Query: page, limit, role, isActive, search.
 * Returns { data: users[], pagination }.
 */
export async function getAllUsers(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      role: filters.role,
      isActive: filters.isActive,
      search: filters.search,
    });
    const response = await api.get(endpoints.getAll, { params });
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
 * getUserById(id) – admin only
 * GET /api/users/:id. Returns { success, data: user }.
 */
export async function getUserById(id) {
  try {
    const response = await api.get(endpoints.getById(id));
    return {
      success: response?.success ?? true,
      data: response?.data ?? response?.user ?? response,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('User not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch user';
    throw new Error(message);
  }
}

/**
 * updateUser(id, userData) – admin only
 * PUT /api/users/:id. userData: { role, isActive, name, email, phone }.
 * Returns { success, data: updatedUser }.
 */
export async function updateUser(id, userData) {
  try {
    const response = await api.put(endpoints.updateUser(id), userData);
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
      'Failed to update user';
    throw new Error(message);
  }
}

/**
 * deleteUser(id) – admin only
 * DELETE /api/users/:id. Returns { success, message }.
 */
export async function deleteUser(id) {
  try {
    const response = await api.delete(endpoints.deleteUser(id));
    return {
      success: response?.success ?? true,
      message: response?.message ?? response?.msg ?? 'User deleted',
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('User not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to delete user';
    throw new Error(message);
  }
}
