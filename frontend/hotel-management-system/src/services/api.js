import axios from 'axios';
// eslint-disable-next-line no-unused-vars -- used when app calls setNotificationHandler(useNotification())
import { useNotification } from '../contexts/NotificationContext'; // We'll use this later

// -----------------------------------------------------------------------------
// Configuration (.env: VITE_API_URL, VITE_API_TIMEOUT)
// -----------------------------------------------------------------------------
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;
const headers = { 'Content-Type': 'application/json' };

const api = axios.create({ baseURL, timeout, headers });

const isDev = import.meta.env.DEV;

// Notification handler – set from app root: setNotificationHandler(useNotification())
let notificationHandler = null;
export function setNotificationHandler(handler) {
  notificationHandler = handler;
}

function notifyError(message) {
  try {
    notificationHandler?.showError?.(message);
  } catch (_) {}
}

// -----------------------------------------------------------------------------
// Request interceptor – attach token, optional dev log
// -----------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (isDev) {
        console.log('[api]', config.method?.toUpperCase(), config.url);
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
// Response interceptor – success: unwrap data
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log('[api] response', response.config?.url, response.data);
    }
    return response.data;
  },
  async (error) => {
    const config = error.config;
    const response = error.response;
    const status = response?.status;

    if (!config) {
      return Promise.reject(error);
    }

    // Retry logic – max 3 retries, exponential backoff, no retry on 4xx
    const retryDelays = [1000, 2000, 4000];
    const retryCount = config.__retryCount ?? 0;
    const isClientError = status >= 400 && status < 500;

    if (!isClientError && retryCount < retryDelays.length) {
      config.__retryCount = retryCount + 1;
      const delay = retryDelays[retryCount];
      await new Promise((r) => setTimeout(r, delay));
      return api.request(config);
    }

    // Error handling by status
    if (status === 401) {
      try {
        localStorage.removeItem('token');
      } catch (_) {}
      notifyError('Session expired. Please log in again.');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    // Instead of window.location, we should use navigate
// But since we can't use hooks here, this is acceptable for now.
// Add a comment noting this should be improved.


    if (status === 403) {
      notifyError('Permission denied');
      return Promise.reject(error);
    }

    if (status === 404) {
      notifyError('Resource not found');
      return Promise.reject(error);
    }

    if (status === 422) {
      const validationErrors = response?.data?.errors ?? response?.data?.message ?? response?.data;
      return Promise.reject({ ...error, validationErrors });
    }

    if (status === 500 || (status >= 500 && status < 600)) {
      notifyError(status === 500 ? 'Server error' : `Server error (${status})`);
    }

    if (!response) {
      notifyError('Network error');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// Cancel tokens – for request cancellation
// -----------------------------------------------------------------------------
export function cancelTokenSource() {
  return axios.CancelToken.source();
}

export const isCancel = axios.isCancel;

// -----------------------------------------------------------------------------
// Optional endpoints object (for consistency)
// -----------------------------------------------------------------------------
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    verify: '/api/auth/verify',
    refresh: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
};

export default api;
