import { useEffect, useState } from 'react';
import { getRelatedAnimes } from '@/lib/animeService';
import { extractApiError } from '@/lib/apiErrors';
import type { AnimeRelation } from '@/types/anime';

interface State {
  relations: AnimeRelation[];
  loading: boolean;
  error: string | null;
}

export function useRelatedAnimes(malId: number | undefined) {
  const [state, setState] = useState<State>({
    relations: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!malId || Number.isNaN(malId)) {
      setState({ relations: [], loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getRelatedAnimes(malId, controller.signal)
      .then((relations) => {
        if (controller.signal.aborted) return;
        setState({ relations, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setState({ relations: [], loading: false, error: null });
          return;
        }
        setState({
          relations: [],
          loading: false,
          error: extractApiError(err),
        });
      });

    return () => controller.abort();
  }, [malId]);

  return state;
}
