import { QueryClient } from '@tanstack/react-query';
import { defaultQueryOptions } from '@/utils/core/queryConfig';

/**
 * Singleton TanStack QueryClient for the entire app.
 */
const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

export default queryClient;
