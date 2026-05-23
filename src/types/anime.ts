export type AnimeStatus = 'finished_airing' | 'currently_airing' | 'not_yet_aired';

export type WatchState = 'COMPLETED' | 'WATCHING' | 'DROPPED' | 'PLAN_TO_WATCH' | 'ON_HOLD';

export interface AnimeRelation {
  relatedMalId: number;
  relationType: string;
  relationLabel: string;
  relatedTitle: string;
  relatedImage: string;
}

export interface Anime {
  malId: number;
  name: string;
  synopsis: string;
  imgMedium: string;
  imgLarge: string;
  startDate: string;
  endDate: string;
  /** Puntuación media en MAL (0–10) */
  malMean: number;
  /** Posición en el ranking de MAL */
  malRank: number;
  /** Puntuación media en Rekko (0–10) */
  mean: number;
  /** Posición en el ranking de Rekko */
  rank: number;
  numEpisodes: number;
  status: AnimeStatus;
  nextUpdate: string;
  likes: number;
  genres: string[];
  studios: string[];
  broadcast: {
    dayOfWeek: string;
    startTime: string;
  };
  // --- Extended fields (B1/B2 enrichment — optional for graceful degradation) ---
  /** Episode duration in seconds (from MAL) — undefined if not enriched yet */
  duration?: number;
  /** e.g. "fall", "spring", "summer", "winter" */
  premieredSeason?: string;
  premieredYear?: number;
  /** e.g. "pg_13" */
  rating?: string;
  /** Virtual field derived from genres (Shounen / Shoujo / Seinen / Josei / Kids) */
  demographic?: string | null;
  /** Self-referential relations (sequels, prequels, etc.) */
  relatedAnimes?: AnimeRelation[];
  // --- User-specific (only present when authenticated) ---
  /** Current user's watch state for this anime */
  userWatchState?: WatchState | null;
  /** Number of episodes the user has marked watched */
  userEpisodeProgress?: number;
  /** User's rating (1-10) */
  userRating?: number;
  /** Whether the current user liked this anime */
  liked?: boolean;
  /** Aggregate count of users that have this in their list */
  inListCount?: number;
  /** Aggregate count of users that completed this anime */
  completedCount?: number;
}

export interface AnimePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AnimeCatalogueResponse {
  animes: Anime[];
  pagination: AnimePagination;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: AnimePagination;
}

export interface AnimePost {
  id: string;
  user: string;
  avatar?: string;
  time: string;
  text: string;
  userImage?: string;
  likes: number;
  comments: number;
  liked?: boolean;
  relatedAnimes: { id: string; title: string; cover?: string }[];
}

export interface RecommendedAnimeItem extends Anime {
  /** Co-appearance count from posts (only present in /recommended-via-posts response) */
  coAppearanceCount?: number;
}
