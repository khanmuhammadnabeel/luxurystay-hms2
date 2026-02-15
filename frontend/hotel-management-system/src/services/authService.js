import api, { endpoints } from './api';

const TOKEN_KEY = 'token';

function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    throw new Error('Failed to store token');
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}

/**
 * login(email, password)
 * POST to /api/auth/login. On success stores token and returns { user, token }.
 */
export async function login(email, password) {
  try {
    const data = await api.post(endpoints.auth.login, { email, password });
    const token = data?.token ?? data?.accessToken;
    const user = data?.user ?? data;
    if (token) {
      setStoredToken(token);
    }
    return { user, token };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      'Login failed';
    throw new Error(message);
  }
}

/**
 * register(userData)
 * POST to /api/auth/register. userData: { name, email, password, phone, role? }.
 * On success stores token and returns { user, token }.
 */
export async function register(userData) {
  try {
    const data = await api.post(endpoints.auth.register, userData);
    const token = data?.token ?? data?.accessToken;
    const user = data?.user ?? data;
    if (token) {
      setStoredToken(token);
    }
    return { user, token };
  } catch (error) {
    if (error?.validationErrors != null) {
      throw error;
    }
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      (Array.isArray(error?.response?.data?.errors)
        ? error.response.data.errors.join(', ')
        : null) ??
      error?.message ??
      'Registration failed';
    throw new Error(message);
  }
}

/**
 * logout()
 * POST to /api/auth/logout, then clears token. Always clears locally.
 */
export async function logout() {
  try {
    await api.post(endpoints.auth.logout);
  } catch (_) {
    // Ignore response; always logout locally
  } finally {
    clearStoredToken();
  }
}

/**
 * verify()
 * GET to /api/auth/verify. Returns { user }. Used to validate token on app load.
 */
export async function verify() {
  try {
    const data = await api.get(endpoints.auth.verify);
    const user = data?.user ?? data;
    return { user };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Verification failed';
    throw new Error(message);
  }
}

/**
 * refreshToken()
 * POST to /api/auth/refresh. Returns { token }. Updates localStorage with new token.
 */
export async function refreshToken() {
  try {
    const data = await api.post(endpoints.auth.refresh);
    const token = data?.token ?? data?.accessToken;
    if (token) {
      setStoredToken(token);
    }
    return { token };
  } catch (error) {
    clearStoredToken();
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Token refresh failed';
    throw new Error(message);
  }
}

/**
 * forgotPassword(email)
 * POST to /api/auth/forgot-password. Body: { email }. Returns { message }.
 */
export async function forgotPassword(email) {
  try {
    const data = await api.post('/api/auth/forgot-password', { email });
    return { message: data?.message ?? data?.msg ?? 'Check your email.' };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      'Request failed';
    throw new Error(message);
  }
}

/**
 * resetPassword(token, newPassword)
 * POST to /api/auth/reset-password. Body: { token, newPassword }. Returns { message }.
 */
export async function resetPassword(token, newPassword) {
  try {
    const data = await api.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return { message: data?.message ?? data?.msg ?? 'Password reset.' };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      'Reset failed';
    throw new Error(message);
  }
}
