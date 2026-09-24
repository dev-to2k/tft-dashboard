"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

interface UseSearchResult {
  query: string;
  debouncedQuery: string;
  setQuery: (value: string) => void;
  clear: () => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const { debounceMs = 300, minLength = 0 } = options;
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (value.length >= minLength) {
        timerRef.current = setTimeout(() => {
          setDebouncedQuery(value);
        }, debounceMs);
      } else {
        setDebouncedQuery('');
      }
    },
    [debounceMs, minLength],
  );

  const clear = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { query, debouncedQuery, setQuery, clear };
}
