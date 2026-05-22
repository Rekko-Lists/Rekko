import { useState, useEffect } from 'react';
import { searchAnimes, type SearchResult } from '@/lib/searchService.ts';
import { extractApiError } from '@/lib/apiErrors';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook con debounce (300ms) + AbortController para la SearchBar global.
 * Mientras el usuario escribe, busca animes en /search. Si la query es
 * más corta que `MIN_QUERY_LENGTH` no dispara ninguna petición.
 */
export function useSearch(): UseSearchReturn {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      searchAnimes(trimmed, controller.signal)
        .then((data) => {
          if (controller.signal.aborted) return;
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          // axios convierte AbortController en err.code === 'ERR_CANCELED'
          if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
          setError(extractApiError(err));
          setResults([]);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { query, setQuery, results, loading, error };
}
