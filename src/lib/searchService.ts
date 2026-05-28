import api from '@/lib/api.ts';
import type { Anime } from '@/types/anime.ts';

export type { Anime };

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface UserResult {
  userId: number;
  username: string;
  profileImage: string;
}

export interface PostResult {
  postId: number;
  title: string;
  user?: { username: string; profileImage: string };
}

export interface SearchResults {
  animes: Anime[];
  users: UserResult[];
  posts: PostResult[];
}

/**
 * @deprecated Use `SearchResults` instead.
 */
export type SearchResult = Anime;

// ---------------------------------------------------------------------------
// Raw envelope shape returned by GET /search
// ---------------------------------------------------------------------------

interface RawSearchEnvelope {
  data?: {
    animes?: Anime[];
    users?: UserResult[];
    posts?: PostResult[];
    withMalData?: boolean;
    // Legacy / fallback shapes
    results?: Anime[];
  } | Anime[];
}

const MIN_QUERY_LENGTH = 3;

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

/**
 * GET /search?q=<query>
 *
 * Returns all three result categories. Requires at least 3 characters
 * (consistent with the backend minimum). Missing sections fall back to [].
 */
export async function search(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { animes: [], users: [], posts: [] };
  }

  const response = await api.get<RawSearchEnvelope>('/search', {
    params: { q: trimmed },
    signal,
  });

  const payload = response.data?.data;

  // Legacy: backend returned a bare array of animes
  if (Array.isArray(payload)) {
    return { animes: payload, users: [], posts: [] };
  }

  // Legacy: data.results
  if (payload?.results) {
    return { animes: payload.results, users: [], posts: [] };
  }

  return {
    animes: payload?.animes ?? [],
    users:  payload?.users  ?? [],
    posts:  payload?.posts  ?? [],
  };
}

// ---------------------------------------------------------------------------
// Deprecated alias — kept so existing code that imports `searchAnimes` keeps
// compiling without modification.
// ---------------------------------------------------------------------------

/**
 * @deprecated Use `search()` instead.
 */
export async function searchAnimes(
  query: string,
  signal?: AbortSignal,
): Promise<Anime[]> {
  const results = await search(query, signal);
  return results.animes;
}
