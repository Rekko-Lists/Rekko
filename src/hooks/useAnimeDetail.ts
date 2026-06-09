import { useEffect, useState } from 'react';
import { getAnimeByMalId } from '@/lib/animeService';
import { extractApiError } from '@/lib/apiErrors';
import type { Anime } from '@/types/anime';

interface State {
  anime: Anime | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useAnimeDetail(malId: number | undefined) {
  const [state, setState] = useState<State>({
    anime: null,
    loading: true,
    error: null,
    notFound: false,
  });

  useEffect(() => {
    if (!malId || Number.isNaN(malId)) {
      setState({ anime: null, loading: false, error: null, notFound: true });
      return;
    }

    const controller = new AbortController();
    setState({ anime: null, loading: true, error: null, notFound: false });

    getAnimeByMalId(malId, controller.signal)
      .then((anime) => {
        if (controller.signal.aborted) return;
        setState({ anime, loading: false, error: null, notFound: false });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setState({ anime: null, loading: false, error: null, notFound: true });
          return;
        }
        setState({
          anime: null,
          loading: false,
          error: extractApiError(err),
          notFound: false,
        });
      });

    return () => controller.abort();
  }, [malId]);

  return state;
}
