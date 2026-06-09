import { useState, useEffect } from 'react';
import { search, type SearchResults, type UserResult, type PostResult } from '@/lib/searchService.ts';
import type { Anime } from '@/types/anime.ts';
import { extractApiError } from '@/lib/apiErrors';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  animes: Anime[];
  users: UserResult[];
  posts: PostResult[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook with debounce (300ms) + AbortController for the global SearchBar.
 * While the user types it calls /search and exposes results split by category.
 * No request is fired for queries shorter than `MIN_QUERY_LENGTH` (3 chars).
 */
export function useSearch(): UseSearchReturn {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResults>({ animes: [], users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults({ animes: [], users: [], posts: [] });
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      search(trimmed, controller.signal)
        .then((data) => {
          if (controller.signal.aborted) return;
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          // axios converts AbortController cancellations to err.code === 'ERR_CANCELED'
          if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
          setError(extractApiError(err));
          setResults({ animes: [], users: [], posts: [] });
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return {
    query,
    setQuery,
    animes: results.animes,
    users:  results.users,
    posts:  results.posts,
    loading,
    error,
  };
}
