import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { SocketProvider } from './SocketContext';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Re-export hooks for convenience
export { useAuth } from './AuthContext';
export { useTheme } from './ThemeContext';
export { useNotification } from './NotificationContext';
export { useSocket } from './SocketContext';