import api from '@/lib/api.ts';
import type {
  Anime,
  AnimeCatalogueResponse,
  AnimePagination,
  AnimePost,
  AnimeRelation,
  PaginatedResponse,
  RecommendedAnimeItem,
  WatchState,
} from '@/types/anime.ts';

type FilterOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'in';

type FilterKey = `${string}[${FilterOperator}]`;

export interface SortEntry {
  field: string;
  order: 'asc' | 'desc';
}

export interface GetAnimesParams {
  page?: number;
  limit?: number;
  sort?: SortEntry[];
  q?: string;
  filters?: Record<FilterKey, string | number>;
}

export interface PaginatedListParams {
  page?: number;
  limit?: number;
}

export interface AnimePostsParams extends PaginatedListParams {
  sortBy?: 'likes' | 'createdAt';
}

// ─── Catalogue & lookups ───────────────────────────────────────────────────

/**
 * Backend sends per-user info nested as `userState: { hasLiked, rate, watchState, watchedEpisodes }`
 * with watchState in lowercase (watching|completed|on_hold|dropped|plan_to_watch).
 * Frontend uses flat fields with WatchState in UPPERCASE. This normalizer bridges them.
 */
function normalizeAnime<T extends Partial<Anime> & { userState?: unknown }>(raw: T): T {
  if (!raw || typeof raw !== 'object') return raw;
  const us = (raw as { userState?: Record<string, unknown> }).userState;
  if (us && typeof us === 'object') {
    if (typeof us.hasLiked === 'boolean') raw.liked = us.hasLiked;
    if (typeof us.rate === 'number') raw.userRating = us.rate;
    if (typeof us.watchedEpisodes === 'number')
      raw.userEpisodeProgress = us.watchedEpisodes;
    if (typeof us.watchState === 'string') {
      raw.userWatchState = us.watchState.toUpperCase() as WatchState;
    }
  }
  return raw;
}

function normalizeAnimes<T extends Partial<Anime> & { userState?: unknown }>(arr: T[]): T[] {
  return Array.isArray(arr) ? arr.map((a) => normalizeAnime(a)) : arr;
}

export async function getGenres(): Promise<string[]> {
  const response = await api.get('/anime/genres');
  return response.data.data.genres as string[];
}

export async function getAnimes(
  params: GetAnimesParams = {},
  signal?: AbortSignal,
): Promise<AnimeCatalogueResponse> {
  const { filters, sort, ...query } = params;

  const sortParams: Record<string, string> = {};
  if (sort && sort.length > 0) {
    sortParams.sortField = sort.map((s) => s.field).join(',');
    sortParams.sortOrder = sort.map((s) => s.order).join(',');
  }

  const queryParams = { ...query, ...sortParams, ...filters };

  const response = await api.get('/anime', { params: queryParams, signal });
  const payload = response.data.data as AnimeCatalogueResponse;
  return {
    ...payload,
    animes: normalizeAnimes(payload.animes ?? []),
  };
}

export async function getAnimeByMalId(
  malId: number,
  signal?: AbortSignal,
): Promise<Anime> {
  const response = await api.get(`/anime/${malId}`, { signal });
  // Backend response shape: { success, message, data: { anime } } or { ...anime }
  const data = response.data.data;
  const anime = (data?.anime ?? data) as Anime;
  return normalizeAnime(anime);
}

export async function getRelatedAnimes(
  malId: number,
  signal?: AbortSignal,
): Promise<AnimeRelation[]> {
  const response = await api.get(`/anime/${malId}/related`, { signal });
  const data = response.data.data;
  return (data?.related ?? data?.relations ?? data ?? []) as AnimeRelation[];
}

// ─── Discovery (B4 endpoints) ──────────────────────────────────────────────

export async function getPostsByAnime(
  malId: number,
  params: AnimePostsParams = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<AnimePost>> {
  const response = await api.get(`/anime/${malId}/posts`, {
    params: { page: 1, limit: 10, sortBy: 'likes', ...params },
    signal,
  });
  const data = response.data.data;
  // Tolerate shape variations: {posts, pagination} | {items, pagination}
  return {
    items: (data?.items ?? data?.posts ?? data ?? []) as AnimePost[],
    pagination: (data?.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: 0,
      pages: 0,
    }) as AnimePagination,
  };
}

export async function getSimilarAnimes(
  malId: number,
  params: PaginatedListParams = {},
  signal?: AbortSignal,
): Promise<Anime[]> {
  const response = await api.get(`/anime/${malId}/similar`, {
    params: { limit: 3, ...params },
    signal,
  });
  const data = response.data.data;
  return (data?.animes ?? data?.items ?? data ?? []) as Anime[];
}

export async function getRecommendedAnimes(
  malId: number,
  params: PaginatedListParams = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<RecommendedAnimeItem>> {
  const response = await api.get(`/anime/${malId}/recommended-via-posts`, {
    params: { page: 1, limit: 20, ...params },
    signal,
  });
  const data = response.data.data;
  return {
    items: (data?.animes ?? data?.items ?? data ?? []) as RecommendedAnimeItem[],
    pagination: (data?.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: 0,
      pages: 0,
    }) as AnimePagination,
  };
}

// ─── User actions ──────────────────────────────────────────────────────────

export async function likeAnime(malId: number): Promise<void> {
  await api.post(`/anime/${malId}/like`);
}

export async function unlikeAnime(malId: number): Promise<void> {
  await api.delete(`/anime/${malId}/like`);
}

/** Backend expects state in lowercase (watching|completed|on_hold|dropped|plan_to_watch). */
function watchStateForApi(state: WatchState): string {
  return state.toLowerCase();
}

export async function setWatchState(
  malId: number,
  state: WatchState,
  numEpisodes?: number,
): Promise<void> {
  // Backend schema is .strict() and requires numEpisodes >= 0 (no undefined allowed).
  await api.post('/anime/watch', {
    malId,
    state: watchStateForApi(state),
    numEpisodes: numEpisodes ?? 0,
  });
}

export async function removeFromList(malId: number): Promise<void> {
  await api.delete(`/anime/watch/${malId}`);
}

export async function setRating(malId: number, rating: number): Promise<void> {
  await api.post('/anime/rate', { malId, rating });
}

export async function removeRating(malId: number): Promise<void> {
  await api.delete(`/anime/rate/${malId}`);
}

export async function setEpisodeProgress(
  malId: number,
  numEpisodes: number,
  state?: WatchState,
): Promise<void> {
  // Backend requires both state and numEpisodes. Default to WATCHING if user
  // bumps episodes before picking a list state explicitly.
  const finalState: WatchState = state ?? 'WATCHING';
  await api.post('/anime/watch', {
    malId,
    numEpisodes,
    state: watchStateForApi(finalState),
  });
}
