import { toast } from 'sonner';
import type { TFunction } from 'i18next';
import { parseError, getUserFriendlyErrorMessage } from '@utils/errorParser';

/**
 * Shows a localized toast for a failed API call.
 */
export function showApiErrorToast(error: unknown, t: TFunction, language: string): void {
  const parsed = parseError(error);
  toast.error(getUserFriendlyErrorMessage(parsed, language, t));
}
