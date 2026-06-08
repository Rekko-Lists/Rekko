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

type RawAnimePost = Omit<Partial<AnimePost>, 'user'> & {
  postId?: number | string;
  title?: string | null;
  description?: string | null;
  photo?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  hasLiked?: boolean;
  userId?: number | string | null;
  user?: string | { username?: string | null; profileImage?: string | null } | null;
  commentsCount?: number;
  commentCount?: number;
  animes?: RawRelatedAnime[];
};

type RawRelatedAnime = {
  id?: string | number;
  malId?: string | number;
  animeId?: string | number;
  title?: string | null;
  name?: string | null;
  cover?: string | null;
  imgMedium?: string | null;
  imgLarge?: string | null;
  anime?: RawRelatedAnime | null;
};

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

function formatPostTime(raw: RawAnimePost): string {
  const value = raw.time ?? raw.createdAt ?? raw.created_at;
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function normalizePost(raw: RawAnimePost, index: number): AnimePost {
  const user = raw.user;
  const username =
    typeof user === 'string'
      ? user
      : user?.username ?? (raw.userId ? `User ${raw.userId}` : 'Unknown user');

  const relatedAnimes = Array.isArray(raw.relatedAnimes)
    ? raw.relatedAnimes
    : normalizeRelatedAnimes(raw.animes);

  return {
    id: String(raw.id ?? raw.postId ?? `anime-post-${index}`),
    user: username,
    avatar: typeof user === 'object' && user ? user.profileImage ?? undefined : raw.avatar,
    time: formatPostTime(raw),
    text: raw.text ?? raw.description ?? raw.title ?? '',
    userImage: raw.userImage ?? raw.photo ?? undefined,
    likes: raw.likes ?? 0,
    comments: raw.comments ?? raw.commentsCount ?? raw.commentCount ?? 0,
    liked: raw.liked ?? raw.hasLiked ?? false,
    relatedAnimes,
  };
}

function normalizeRelatedAnimes(rawAnimes: RawRelatedAnime[] | undefined): AnimePost['relatedAnimes'] {
  if (!Array.isArray(rawAnimes)) return [];

  return rawAnimes.flatMap((item) => {
    const anime = item.anime ?? item;
    const id = anime.malId ?? anime.id ?? anime.animeId;
    const title = anime.title ?? anime.name;

    if (!id || !title) return [];

    return [{
      id: String(id),
      title,
      cover: anime.cover ?? anime.imgMedium ?? anime.imgLarge ?? '',
    }];
  });
}

function normalizePosts(rawPosts: unknown): AnimePost[] {
  return Array.isArray(rawPosts)
    ? rawPosts.map((post, index) => normalizePost(post as RawAnimePost, index))
    : [];
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
    items: normalizePosts(data?.items ?? data?.posts ?? data),
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

async function getAnimeWidget(endpoint: string, limit: number, signal?: AbortSignal): Promise<Anime[]> {
  const response = await api.get(endpoint, { params: { limit }, signal });
  return normalizeAnimes((response.data.data?.animes ?? []) as Anime[]);
}

export async function getTopSeasonalAnimes(limit = 5, signal?: AbortSignal): Promise<Anime[]> {
  return getAnimeWidget('/anime/seasonal/top', limit, signal);
}

export async function getPopularAnimes(limit = 5, signal?: AbortSignal): Promise<Anime[]> {
  return getAnimeWidget('/anime/popular', limit, signal);
}

export async function getAiringTodayAnimes(limit = 5, signal?: AbortSignal): Promise<Anime[]> {
  return getAnimeWidget('/anime/airing-today', limit, signal);
}

export async function getTopUpcomingAnimes(limit = 5, signal?: AbortSignal): Promise<Anime[]> {
  return getAnimeWidget('/anime/top-upcoming', limit, signal);
}

export async function getPopularUpcomingAnimes(limit = 5, signal?: AbortSignal): Promise<Anime[]> {
  return getAnimeWidget('/anime/popular-upcoming', limit, signal);
}

export async function getTopAiringAnimes(limit = 5, signal?: AbortSignal): Promise<Anime[]> {
  return getAnimeWidget('/anime/top-airing', limit, signal);
}

export async function getWeeklyAiringAnimes(limit = 110, signal?: AbortSignal): Promise<Anime[]> {
  return getAnimeWidget('/anime/weekly-airing', limit, signal);
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

// ─── User list (watch + rate) ──────────────────────────────────────────────

export interface WatchListItem {
  userWatchAnimeId: number;
  userId: number;
  animeId: number;
  numEpisodes: number;
  state: string;
  anime: {
    malId: number;
    name: string;
    imgMedium: string;
    imgLarge: string;
    malMean: number;
    malRank: number;
    mean: number;
    numEpisodes: number;
    status: string;
    mediaType: string;
    likes: number;
    broadcast: { dayOfWeek: string; startTime: string };
  };
}

export interface RateListItem {
  userRateAnimeId: number;
  userId: number;
  animeId: number;
  rate: number;
  anime: {
    malId: number;
    name: string;
    imgMedium: string;
    imgLarge: string;
    malMean: number;
    malRank: number;
    mean: number;
    status: string;
    mediaType: string;
    likes: number;
  };
}

export async function getUserWatchList(
  userId: number,
  params: PaginatedListParams = {},
  signal?: AbortSignal,
): Promise<{ watchList: WatchListItem[]; pagination: AnimePagination }> {
  const response = await api.get(`/anime/watch/user/${userId}`, {
    params: { page: 1, limit: 110, ...params },
    signal,
  });
  return response.data.data;
}

export async function getUserRateList(
  userId: number,
  params: PaginatedListParams = {},
  signal?: AbortSignal,
): Promise<{ ratingList: RateListItem[]; pagination: AnimePagination }> {
  const response = await api.get(`/anime/rate/user/${userId}`, {
    params: { page: 1, limit: 110, ...params },
    signal,
  });
  return response.data.data;
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
