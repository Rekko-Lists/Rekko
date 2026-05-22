import { useState, useEffect } from "react";
import type { Anime, AnimePagination } from "@/types/anime.ts";
import { getAnimes, type GetAnimesParams } from "@/lib/animeService.ts";
import { extractApiError } from "@/lib/apiErrors";

interface State {
  animes: Anime[];
  pagination: AnimePagination | null;
  loading: boolean;
  error: string | null;
}

export function useAnimeCatalogue(initialParams: GetAnimesParams = {}) {
  const [params, setParams] = useState<GetAnimesParams>({
    page: 1,
    limit: 110,
    ...initialParams,
  });

  const [state, setState] = useState<State>({
    animes: [],
    pagination: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    getAnimes(params, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({
          animes: data.animes,
          pagination: data.pagination,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: extractApiError(err),
        }));
      });

    return () => controller.abort();
  }, [params]);

  const setPage  = (page: number)  => setParams((prev) => ({ ...prev, page }));
  const setLimit = (limit: number) => setParams((prev) => ({ ...prev, limit }));

  const setFilters = (filters: GetAnimesParams["filters"]) =>
    setParams((prev) => ({ ...prev, page: 1, filters }));

  // Resetea todos los params de una vez (sort + filters) con una sola llamada.
  // Usar esto al cambiar de tab para no disparar dos efectos seguidos.
  const resetParams = (overrides: Partial<GetAnimesParams> = {}) =>
    setParams({ page: 1, limit: 110, ...overrides });

  return { ...state, params, setPage, setLimit, setFilters, resetParams };
}
