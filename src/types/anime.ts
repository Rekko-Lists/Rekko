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
  status: 'finished_airing' | 'currently_airing' | 'not_yet_aired';
  nextUpdate: string;
  likes: number;
  genres: string[];
  studios: string[];
  broadcast: {
    dayOfWeek: string;
    startTime: string;
  };
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
