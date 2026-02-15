import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// -----------------------------------------------------------------------------
// Notification types (for UI theming later)
// -----------------------------------------------------------------------------
// success  → gold theme
// error    → crimson red
// warning  → amber
// info     → blue

// -----------------------------------------------------------------------------
// Notification object structure
// -----------------------------------------------------------------------------
// {
//   id: string (uuid),
//   type: 'success' | 'error' | 'warning' | 'info',
//   message: string,
//   title?: string (optional),
//   duration: number (ms, default: 3000),
//   createdAt: Date
// }

// -----------------------------------------------------------------------------
// UI component (to be created later)
// -----------------------------------------------------------------------------
// - Map through notifications array; each item with type-based styling
// - Positioning: fixed, top-right; stack vertically; z-index: 9999
// - Dismiss button per notification

const NotificationContext = createContext();

const DEFAULT_DURATION = 3000;
const MAX_NOTIFICATIONS = 5;

const isDev = import.meta.env.DEV;

/** Safe unique id (fallback if uuid fails). Never throws. */
function safeId() {
  try {
    return uuidv4();
  } catch (e) {
    if (isDev) console.warn('[NotificationContext] uuid failed:', e);
    return `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const maxNotifications = MAX_NOTIFICATIONS;
  const timeoutsRef = useRef({});

  // ---------------------------------------------------------------------------
  // Clear all timeouts on unmount (prevent setState after unmount)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {};
    };
  }, []);

  // ---------------------------------------------------------------------------
  // dismissNotification(id) – remove one and clear its timer
  // ---------------------------------------------------------------------------
  const dismissNotification = useCallback((id) => {
    if (timeoutsRef.current[id] != null) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // dismissAll() – clear all notifications and timers
  // ---------------------------------------------------------------------------
  const dismissAll = useCallback(() => {
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
    setNotifications([]);
  }, []);

  // ---------------------------------------------------------------------------
  // showNotification(message, options = {})
  // options: { type, title, duration }
  // New notifications don't affect existing timers; auto-dismiss after duration.
  // ---------------------------------------------------------------------------
  const showNotification = useCallback((message, options = {}) => {
    try {
      const { type = 'info', title, duration = DEFAULT_DURATION } = options;
      const id = safeId();
      const createdAt = new Date();

      const notification = {
        id,
        type,
        message: typeof message === 'string' ? message : String(message ?? ''),
        ...(title != null && { title }),
        duration,
        createdAt,
      };

      setNotifications((prev) => {
        const next = [...prev, notification];
        if (next.length > maxNotifications) {
          const removed = next.shift();
          if (removed?.id && timeoutsRef.current[removed.id] != null) {
            clearTimeout(timeoutsRef.current[removed.id]);
            delete timeoutsRef.current[removed.id];
          }
        }
        return next;
      });

      const timeoutId = setTimeout(() => {
        delete timeoutsRef.current[id];
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);

      timeoutsRef.current[id] = timeoutId;
    } catch (e) {
      if (isDev) console.warn('[NotificationContext] showNotification error:', e);
    }
  }, [maxNotifications]);

  // ---------------------------------------------------------------------------
  // Shortcuts (type-only)
  // ---------------------------------------------------------------------------
  const showSuccess = useCallback(
    (message, options = {}) => showNotification(message, { ...options, type: 'success' }),
    [showNotification]
  );
  const showError = useCallback(
    (message, options = {}) => showNotification(message, { ...options, type: 'error' }),
    [showNotification]
  );
  const showWarning = useCallback(
    (message, options = {}) => showNotification(message, { ...options, type: 'warning' }),
    [showNotification]
  );
  const showInfo = useCallback(
    (message, options = {}) => showNotification(message, { ...options, type: 'info' }),
    [showNotification]
  );

  const value = {
    notifications,
    maxNotifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
