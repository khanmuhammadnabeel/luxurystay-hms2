import { createContext, useContext, useState, useEffect } from 'react';

// -----------------------------------------------------------------------------
// Theme types
// -----------------------------------------------------------------------------
// 'dark' – default (Midnight Velvet)
// 'light' – optional future use

// -----------------------------------------------------------------------------
// Color palette – Dark theme (Midnight Velvet)
// -----------------------------------------------------------------------------
const DARK_PALETTE = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  gold: '#CFAF7E',
  textPrimary: 'rgba(255,255,255,0.95)',
  textSecondary: 'rgba(255,255,255,0.6)',
  border: 'rgba(207,175,126,0.2)',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const STORAGE_KEY = 'luxury-theme';

const ThemeContext = createContext();

function getSystemPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return getSystemPreference();
}

function applyCssVariables(theme) {
  const root = document.documentElement;
  const palette = theme === 'dark' ? DARK_PALETTE : DARK_PALETTE; // light palette TBD
  root.style.setProperty('--bg-primary', palette.background);
  root.style.setProperty('--bg-surface', palette.surface);
  root.style.setProperty('--color-gold', palette.gold);
  root.style.setProperty('--text-primary', palette.textPrimary);
  root.style.setProperty('--text-secondary', palette.textSecondary);
  root.style.setProperty('--border-gold', palette.border);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Load saved theme / system preference after mount (hydration fix)
  useEffect(() => {
    setThemeState(getInitialTheme());
    setMounted(true);
  }, []);

  // Inject CSS variables when theme changes
  useEffect(() => {
    if (!mounted) return;
    applyCssVariables(theme);
  }, [theme, mounted]);

  const setTheme = (newTheme) => {
    if (newTheme !== 'dark' && newTheme !== 'light') return;
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    getSystemPreference,
    colors: {
      background: DARK_PALETTE.background,
      surface: DARK_PALETTE.surface,
      gold: DARK_PALETTE.gold,
      textPrimary: DARK_PALETTE.textPrimary,
      textSecondary: DARK_PALETTE.textSecondary,
      border: DARK_PALETTE.border,
      success: DARK_PALETTE.success,
      error: DARK_PALETTE.error,
      warning: DARK_PALETTE.warning,
      info: DARK_PALETTE.info,
    },
  };

  // Prevent hydration mismatch: render nothing until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
