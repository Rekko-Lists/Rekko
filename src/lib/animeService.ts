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
  return response.data.data;
}

export async function getAnimeByMalId(
  malId: number,
  signal?: AbortSignal,
): Promise<Anime> {
  const response = await api.get(`/anime/${malId}`, { signal });
  // Backend response shape: { success, message, data: { anime } } or { ...anime }
  const data = response.data.data;
  return (data?.anime ?? data) as Anime;
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

export async function setWatchState(
  malId: number,
  state: WatchState,
  numEpisodes?: number,
): Promise<void> {
  await api.post('/anime/watch', { malId, state, numEpisodes });
}

export async function setRating(malId: number, rating: number): Promise<void> {
  await api.post('/anime/rate', { malId, rating });
}

export async function setEpisodeProgress(
  malId: number,
  numEpisodes: number,
  state?: WatchState,
): Promise<void> {
  await api.post('/anime/watch', { malId, numEpisodes, state });
}
