import type { TFunction } from 'i18next';

/**
 * Categories of errors the app can encounter.
 */
export type ErrorCategory =
  | 'network'
  | 'server'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'unknown';

interface ParsedError {
  category: ErrorCategory;
  message: string;
  status?: number;
}

/**
 * Parses an unknown error into a structured object.
 */
export function parseError(error: unknown): ParsedError {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('network') || msg.includes('timeout')) {
      return { category: 'network', message: error.message };
    }
  }

  const axiosErr = error as { response?: { status?: number; data?: { message?: string } } };
  const status = axiosErr?.response?.status;
  const serverMsg = axiosErr?.response?.data?.message || (error instanceof Error ? error.message : 'Unknown error');

  if (status === 401) return { category: 'unauthorized', message: serverMsg, status };
  if (status === 403) return { category: 'forbidden', message: serverMsg, status };
  if (status === 404) return { category: 'notFound', message: serverMsg, status };
  if (status && status >= 500) return { category: 'server', message: serverMsg, status };

  return { category: 'unknown', message: serverMsg };
}

/**
 * Returns a user-friendly, localized error message suitable for a toast.
 */
export function getUserFriendlyErrorMessage(
  parsed: ParsedError,
  language: string,
  t: TFunction,
): string {
  const key = `errors.${parsed.category === 'unknown' ? 'generic' : parsed.category}`;
  return t(key);
}
