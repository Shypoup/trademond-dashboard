import React, { useLayoutEffect } from 'react';

const STORAGE_KEY = 'trademond-theme-preference';

/** User-selectable appearance: fixed light/dark or follow OS. */
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** Stored choice (light / dark / system). */
  preference: ThemePreference;
  /** Effective palette after resolving `system`. */
  resolved: 'light' | 'dark';
  /** Persist preference and update the document class. */
  setPreference: (value: ThemePreference) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * Reads OS dark-mode preference.
 */
function getSystemIsDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Applies `dark` on `<html>` and `color-scheme` for native form controls.
 */
function applyRootTheme(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

/**
 * Resolves `system` to light or dark using `prefers-color-scheme`.
 */
function resolvePreference(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') return getSystemIsDark() ? 'dark' : 'light';
  return pref;
}

/**
 * Provides theme preference (light / dark / system), persists to `localStorage`,
 * and syncs the `dark` class on `document.documentElement`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = React.useState<ThemePreference>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
    } catch {
      /* ignore */
    }
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = React.useState(() =>
    typeof window !== 'undefined' ? getSystemIsDark() : false,
  );

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemIsDark(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolved = React.useMemo((): 'light' | 'dark' => {
    if (preference === 'system') return systemIsDark ? 'dark' : 'light';
    return preference;
  }, [preference, systemIsDark]);

  useLayoutEffect(() => {
    applyRootTheme(resolved === 'dark');
  }, [resolved]);

  const setPreference = React.useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Access to theme preference and setter. Must be used inside {@link ThemeProvider}.
 */
export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
