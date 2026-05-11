import { useEffect, useState } from 'react';

/**
 * Returns a value that only updates after `delayMs` of stability.
 * Used to throttle search-as-you-type without spamming the API.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
};
