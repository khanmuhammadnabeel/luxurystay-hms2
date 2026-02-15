import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set base URL for all API calls
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------
// user: object with id, name, email, role (or null)
// token: from localStorage or null
// loading: true until initial verification completes
// error: string or null

const AuthContext = createContext();

/**
 * AuthProvider – manages auth state, token verification, login, register, logout.
 * Renders children only after initial token verification is complete.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ---------------------------------------------------------------------------
  // Axios: attach token to all requests
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // ---------------------------------------------------------------------------
  // Validate token on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setLoading(false);
        setInitialized(true);
        return;
      }
      try {
        const { data } = await axios.get('/api/auth/verify');
        setUser(data.user ?? data);
      } catch (err) {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }
    verifyToken();
  }, []);

  // ---------------------------------------------------------------------------
  // Clear error after 3 seconds
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  // ---------------------------------------------------------------------------
  // login(email, password)
  // ---------------------------------------------------------------------------
  async function login(email, password) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      const newToken = data.token ?? data.accessToken;
      const userData = data.user ?? data;
      if (newToken) {
        setToken(newToken);
        setUser(userData);
        setError(null);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ??
        err.response?.data?.error ??
        err.message ??
        'Login failed';
      setError(message);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // register(userData)
  // ---------------------------------------------------------------------------
  async function register(userData) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      const newToken = data.token ?? data.accessToken;
      const userFromRes = data.user ?? data;
      if (newToken && userFromRes) {
        setToken(newToken);
        setUser(userFromRes);
        setError(null);
      } else {
        setError(data.message || 'Registration successful. Please log in.');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ??
        err.response?.data?.error ??
        (err.response?.status === 422 && 'Validation failed') ??
        err.message ??
        'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // logout()
  // ---------------------------------------------------------------------------
  async function logout() {
    setError(null);
    try {
      await axios.post('/api/auth/logout');
    } catch {
      // Ignore errors; we still clear local state
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  // ---------------------------------------------------------------------------
  // updateUser(data)
  // ---------------------------------------------------------------------------
  function updateUser(data) {
    setUser((prev) => (prev ? { ...prev, ...data } : data));
  }

  // ---------------------------------------------------------------------------
  // Role helpers (derived from user.role)
  // ---------------------------------------------------------------------------
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isStaff = ['admin', 'manager', 'staff'].includes(user?.role);
  const isGuest = user?.role === 'guest';

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isManager,
    isStaff,
    isGuest,
  };

  // Only render children after initial verification complete (loading = initial only here)
  if (!initialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
