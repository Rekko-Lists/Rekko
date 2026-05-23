import { useEffect, useState } from 'react';
import { getSimilarAnimes } from '@/lib/animeService';
import { extractApiError } from '@/lib/apiErrors';
import type { Anime } from '@/types/anime';

interface State {
  animes: Anime[];
  loading: boolean;
  error: string | null;
}

export function useSimilarAnimes(malId: number | undefined, limit = 3) {
  const [state, setState] = useState<State>({
    animes: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!malId || Number.isNaN(malId)) {
      setState({ animes: [], loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getSimilarAnimes(malId, { limit }, controller.signal)
      .then((animes) => {
        if (controller.signal.aborted) return;
        setState({ animes, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setState({ animes: [], loading: false, error: null });
          return;
        }
        setState({
          animes: [],
          loading: false,
          error: extractApiError(err),
        });
      });

    return () => controller.abort();
  }, [malId, limit]);

  return state;
}
