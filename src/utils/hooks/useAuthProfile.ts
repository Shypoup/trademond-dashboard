import { useQuery } from '@tanstack/react-query';
import { authService } from '@services/authService';

export const AUTH_PROFILE_QUERY_KEY = ['auth', 'profile'] as const;

/**
 * Loads the signed-in admin user from `GET /api/me` for the header and profile UI.
 */
export function useAuthProfile() {
  return useQuery({
    queryKey: AUTH_PROFILE_QUERY_KEY,
    queryFn: () => authService.getProfile(),
    staleTime: 60_000,
    retry: 1,
  });
}
