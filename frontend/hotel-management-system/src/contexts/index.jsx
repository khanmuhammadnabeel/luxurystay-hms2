import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { SocketProvider } from './SocketContext';
import { LocalizationProvider } from './LocalizationContext';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <NotificationProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </NotificationProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Re-export hooks for convenience
export { useAuth } from './AuthContext';
export { useTheme } from './ThemeContext';
export { useNotification } from './NotificationContext';
export { useSocket } from './SocketContext';
export { useLocalization } from './LocalizationContext';