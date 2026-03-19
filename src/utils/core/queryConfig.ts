import type { DefaultOptions } from '@tanstack/react-query';

/**
 * Default React Query options shared across the app.
 */
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  },
};
