/**
 * Centralized color constants used across the dashboard.
 * Prefer Tailwind classes wherever possible; use these for dynamic JS values.
 */
/** Six-digit hex (no `#`) for avatar services that expect `background=…` query params. */
export const BRAND_PRIMARY_HEX_PARAM = '00a38d';

export const COLORS = {
  /** Primary brand accent (matches `--primary` / `--color-brand-cyan`) */
  brandCyan: '#00a38d',
  /** Darker teal for hovers / emphasis */
  brandTeal: '#008f7a',
  /** Deepest shell tone (matches dark `--background` family) */
  brandDark: '#001b1b',
  sidebarBorder: '#0e3131',
  sidebarActiveBg: 'rgba(0, 128, 128, 0.1)',
  sidebarActiveBorder: 'rgba(0, 128, 128, 0.2)',
} as const;
