import { useEffect, useState } from 'react';
import { getPostsByAnime, type AnimePostsParams } from '@/lib/animeService';
import { extractApiError } from '@/lib/apiErrors';
import type { AnimePagination, AnimePost } from '@/types/anime';

interface State {
  posts: AnimePost[];
  pagination: AnimePagination | null;
  loading: boolean;
  error: string | null;
}

export function useAnimePosts(
  malId: number | undefined,
  params: AnimePostsParams = {},
) {
  const [state, setState] = useState<State>({
    posts: [],
    pagination: null,
    loading: true,
    error: null,
  });

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const sortBy = params.sortBy ?? 'likes';

  useEffect(() => {
    if (!malId || Number.isNaN(malId)) {
      setState({ posts: [], pagination: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    getPostsByAnime(malId, { page, limit, sortBy }, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({
          posts: data.items,
          pagination: data.pagination,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setState({ posts: [], pagination: null, loading: false, error: null });
          return;
        }
        setState({
          posts: [],
          pagination: null,
          loading: false,
          error: extractApiError(err),
        });
      });

    return () => controller.abort();
  }, [malId, page, limit, sortBy]);

  return state;
}
