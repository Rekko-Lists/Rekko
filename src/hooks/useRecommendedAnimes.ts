import { useEffect, useState } from 'react';
import { getRecommendedAnimes } from '@/lib/animeService';
import { extractApiError } from '@/lib/apiErrors';
import type { AnimePagination, RecommendedAnimeItem } from '@/types/anime';

interface State {
  animes: RecommendedAnimeItem[];
  pagination: AnimePagination | null;
  loading: boolean;
  error: string | null;
}

export function useRecommendedAnimes(
  malId: number | undefined,
  page = 1,
  limit = 20,
) {
  const [state, setState] = useState<State>({
    animes: [],
    pagination: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!malId || Number.isNaN(malId)) {
      setState({ animes: [], pagination: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getRecommendedAnimes(malId, { page, limit }, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({
          animes: data.items,
          pagination: data.pagination,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setState({ animes: [], pagination: null, loading: false, error: null });
          return;
        }
        setState({
          animes: [],
          pagination: null,
          loading: false,
          error: extractApiError(err),
        });
      });

    return () => controller.abort();
  }, [malId, page, limit]);

  return state;
}
