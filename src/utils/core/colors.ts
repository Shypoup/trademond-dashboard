/**
 * Centralized color constants used across the dashboard.
 * Prefer Tailwind classes wherever possible; use these for dynamic JS values.
 */
export const COLORS = {
  brandCyan: '#008080',
  brandTeal: '#005f5f',
  brandDark: '#0a2525',
  sidebarBorder: '#0e3131',
  sidebarActiveBg: 'rgba(0, 128, 128, 0.1)',
  sidebarActiveBorder: 'rgba(0, 128, 128, 0.2)',
} as const;
