import * as React from 'react';

/**
 * Debounces a value for search inputs and similar delayed effects.
 *
 * @param value - Live value from controlled input
 * @param delayMs - Debounce interval in milliseconds
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
