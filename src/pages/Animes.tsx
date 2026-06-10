import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AnimeCard from "@/components/ui/anime/AnimeCard";
import SubNav from "@/components/ui/filter/SubNav";
import QuickFilter, {
  FilterProperty,
} from "@/components/ui/filter/QuickFilter";
import AdvancedFilterPanel, {
  AdvancedFilterValues,
  INITIAL_FILTER_VALUES,
} from "@/components/ui/filter/AdvancedFilterPanel";
import Pagination from "@/components/ui/common/Pagination";
import { useAnimeCatalogue } from "@/hooks/useAnimeCatalogue";
import { useRecommendedAnimes } from "@/hooks/useRecommendedAnimes";
import { useAnimeDetail } from "@/hooks/useAnimeDetail";
import { useRelatedAnimes } from "@/hooks/useRelatedAnimes";
import type { GetAnimesParams } from "@/lib/animeService";
import { getGenres } from "@/lib/animeService";
import { computeSeasonOptions } from "@/lib/seasonUtils";
import type { Anime, AnimeRelation } from "@/types/anime";
import Seo from "@/components/seo/Seo";
import { itemListJsonLd, pageJsonLd } from "@/components/seo/jsonLd";
import { seoPages } from "@/components/seo/pages";

const DEFAULT_TYPE_FILTER = { "mediaType[in]": "tv,ova,movie" } as const;
const CARD_WIDTH = 180;
const CARD_GAP = 16;
const PAGE_MAX_LIMIT = 110;
const ADVANCED_PANEL_WIDTH = 461;
const BODY_GAP = 8;

// Params por tab — sort + filtros de una vez para evitar doble efecto
const TAB_CONFIG: Record<string, Partial<GetAnimesParams>> = {
  "View All": {
    sort: [{ field: "malMean", order: "desc" }],
    filters: { ...DEFAULT_TYPE_FILTER },
  },
  "Top Anime": {
    sort: [{ field: "malRank", order: "asc" }],
    filters: { "malRank[ne]": 0, "malRank[lte]": 500, ...DEFAULT_TYPE_FILTER },
  },
  "Seasonal Anime": {
    sort: [{ field: "startDate", order: "desc" }],
    filters: { "status[eq]": "currently_airing", ...DEFAULT_TYPE_FILTER },
  },
  "By Genre": {},
};

// Mapeo URL <-> nombre de tab interno
const URL_TO_TAB: Record<string, string> = {
  all: "View All",
  top: "Top Anime",
  seasonal: "Seasonal Anime",
  "by-genre": "By Genre",
};
const TAB_TO_URL: Record<string, string> = {
  "View All": "all",
  "Top Anime": "top",
  "Seasonal Anime": "seasonal",
  "By Genre": "by-genre",
};

function relationToAnime(relation: AnimeRelation): Anime {
  return {
    malId: relation.relatedMalId,
    name: relation.relatedTitle,
    synopsis: "",
    imgMedium: relation.relatedImage ?? "",
    imgLarge: relation.relatedImage ?? "",
    startDate: "",
    endDate: "",
    malMean: 0,
    malRank: 0,
    mean: 0,
    rank: 0,
    numEpisodes: 0,
    status: "finished_airing",
    nextUpdate: "",
    likes: 0,
    genres: [],
    studios: [],
    broadcast: { dayOfWeek: "", startTime: "" },
  };
}

// Opciones de temporada — computadas una sola vez al cargar el módulo
const SEASON_OPTIONS = computeSeasonOptions();

const STATIC_TYPE_OPTIONS = [
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
];

const STATIC_STATUS_OPTIONS = [
  { value: "currently_airing", label: "Airing" },
  { value: "finished_airing", label: "Finished" },
  { value: "not_yet_aired", label: "Upcoming" },
];

function getResponsiveAnimeLimit(advOpen: boolean): number {
  if (typeof window === "undefined") return PAGE_MAX_LIMIT;

  const bodyWidth = window.innerWidth * 0.88;
  const availableWidth = advOpen
    ? bodyWidth - ADVANCED_PANEL_WIDTH - BODY_GAP
    : bodyWidth;
  const columns = Math.max(
    1,
    Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)),
  );

  return Math.max(columns, Math.floor(PAGE_MAX_LIMIT / columns) * columns);
}

function useResponsiveAnimeLimit(advOpen: boolean): number {
  const [limit, setLimit] = useState(() => getResponsiveAnimeLimit(advOpen));

  useEffect(() => {
    function updateLimit() {
      setLimit(getResponsiveAnimeLimit(advOpen));
    }

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, [advOpen]);

  return limit;
}

const AVAILABLE_GENRES = [
  { value: "Action", label: "Action" },
  { value: "Adventure", label: "Adventure" },
  { value: "Comedy", label: "Comedy" },
  { value: "Drama", label: "Drama" },
  { value: "Fantasy", label: "Fantasy" },
  { value: "Romance", label: "Romance" },
];

const styles = {
  page: "flex flex-col font-gabarito min-h-full pt-4",
  body: "flex gap-2 px-4 pb-8 md:px-[6%]",
  grid: "flex-1 grid gap-3 pt-4 content-start grid-cols-[repeat(auto-fill,minmax(110px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-4 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]",
  loading: "flex-1 flex items-center justify-center text-text-muted py-20",
  error: "flex-1 flex items-center justify-center text-status-red py-20",
  letterGrid: "flex-1 pt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5",
  letterBox:
    "bg-surface border-[1.5px] border-border rounded-card px-6 py-5 flex flex-col",
  letterBadge:
    "text-primary font-bold text-base mb-3 pb-2 border-b border-border-light text-center",
  genreLink:
    "block w-full text-sm text-text-main hover:text-primary cursor-pointer py-2 transition-colors text-center",
  breadcrumb: "w-full flex items-center gap-1.5 pb-2 mb-1 text-xs",
};

export default function Animes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const recommendedForParam = searchParams.get("recommendedFor");
  const recommendedFor = recommendedForParam
    ? parseInt(recommendedForParam, 10)
    : undefined;
  const isRecommendedView = Boolean(
    recommendedFor && !Number.isNaN(recommendedFor),
  );
  const relatedToParam = searchParams.get("relatedTo");
  const relatedTo = relatedToParam ? parseInt(relatedToParam, 10) : undefined;
  const isRelatedView = Boolean(relatedTo && !Number.isNaN(relatedTo));

  // ─── URL state ──────────────────────────────────────────────────────────
  const urlTab = searchParams.get("tab") ?? "all";
  const activeTab = URL_TO_TAB[urlTab] ?? "View All";
  const advOpen = searchParams.get("adv") === "1";
  const responsiveLimit = useResponsiveAnimeLimit(advOpen);
  const urlPage = Number(searchParams.get("page") ?? "1") || 1;
  const urlLimit =
    Number(searchParams.get("limit") ?? String(responsiveLimit)) ||
    responsiveLimit;
  const urlGenre = searchParams.get("genre") ?? "";
  const urlType = searchParams.get("type") ?? "";
  const urlStatus = searchParams.get("status") ?? "";
  const urlSeason = searchParams.get("season") ?? "";
  const urlQ = searchParams.get("q") ?? "";
  const urlEpisodesMin = searchParams.get("episodesMin");
  const urlEpisodesMax = searchParams.get("episodesMax");
  const urlRatingMin = searchParams.get("ratingMin");
  const urlRatingMax = searchParams.get("ratingMax");

  const updateParams = useCallback(
    (patch: Record<string, string | null>, opts?: { resetPage?: boolean }) => {
      const next = new URLSearchParams(searchParams);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      if (opts?.resetPage) next.delete("page");
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams],
  );

  const [genres, setGenres] =
    useState<{ value: string; label: string }[]>(AVAILABLE_GENRES);
  const [advValues, setAdvValues] = useState<AdvancedFilterValues>(() => ({
    ...INITIAL_FILTER_VALUES,
    genres: urlGenre ? urlGenre.split(",").filter(Boolean) : [],
    type: urlType || undefined,
    seasonKey: urlSeason || undefined,
    episodesMin: urlEpisodesMin ? Number(urlEpisodesMin) : undefined,
    episodesMax: urlEpisodesMax ? Number(urlEpisodesMax) : undefined,
    ratingMin: urlRatingMin ? Number(urlRatingMin) : 0,
    ratingMax: urlRatingMax ? Number(urlRatingMax) : 10,
  }));
  const [selectedGenre, setSelectedGenre] = useState<string | null>(
    activeTab === "By Genre" && urlGenre ? urlGenre : null,
  );
  const [recommendedPage, setRecommendedPage] = useState(1);

  // Construir los params iniciales basados en URL (tab + quick filters + adv)
  const buildParamsFromUrl = useCallback((): GetAnimesParams => {
    const base: Partial<GetAnimesParams> = { ...TAB_CONFIG[activeTab] };
    const filters: GetAnimesParams["filters"] = { ...(base.filters ?? {}) };

    // By-genre selección
    if (activeTab === "By Genre" && urlGenre) {
      filters["genres[eq]"] = urlGenre;
      base.sort = [{ field: "malMean", order: "desc" }];
    }

    // Quick / adv: en avanzado, fusionar todo
    if (advOpen) {
      if (urlGenre) filters["genres[eq]"] = urlGenre;
      if (urlRatingMin && Number(urlRatingMin) > 0)
        filters["malMean[gte]"] = Number(urlRatingMin);
      if (urlRatingMax && Number(urlRatingMax) < 10)
        filters["malMean[lte]"] = Number(urlRatingMax);
      if (urlEpisodesMin) filters["numEpisodes[gte]"] = Number(urlEpisodesMin);
      if (urlEpisodesMax) filters["numEpisodes[lte]"] = Number(urlEpisodesMax);
      if (urlSeason) {
        const season = SEASON_OPTIONS.find((s) => s.value === urlSeason);
        if (season) {
          filters["startDate[gte]"] = season.gte;
          if (season.lt) filters["startDate[lt]"] = season.lt;
        }
      }
    } else {
      // Quick filter merge
      if (urlGenre && activeTab !== "By Genre")
        filters["genres[eq]"] = urlGenre;
      if (urlType) filters["mediaType[eq]"] = urlType;
      if (urlStatus) filters["status[eq]"] = urlStatus;
    }

    return {
      ...base,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      page: urlPage,
      limit: urlLimit,
      q: urlQ || undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    advOpen,
    urlGenre,
    urlType,
    urlStatus,
    urlSeason,
    urlQ,
    urlPage,
    urlLimit,
    urlEpisodesMin,
    urlEpisodesMax,
    urlRatingMin,
    urlRatingMax,
  ]);

  const { animes, pagination, loading, error, resetParams } =
    useAnimeCatalogue(buildParamsFromUrl());

  // Resincronizar el hook cada vez que cambie la URL.
  // Skip primer run: el hook ya se inicializó con buildParamsFromUrl() en useState,
  // así que el primer fetch ya está disparado — evitamos duplicarlo.
  const isFirstSync = useRef(true);
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    resetParams(buildParamsFromUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildParamsFromUrl]);

  // Recommended-for branch — uses separate hook
  const {
    animes: recommendedAnimes,
    pagination: recommendedPagination,
    loading: recommendedLoading,
    error: recommendedError,
  } = useRecommendedAnimes(
    isRecommendedView ? recommendedFor : undefined,
    recommendedPage,
    24,
  );

  const { anime: anchorAnime } = useAnimeDetail(
    isRecommendedView ? recommendedFor : undefined,
  );
  const {
    relations: relatedRelations,
    loading: relatedLoading,
    error: relatedError,
  } = useRelatedAnimes(isRelatedView ? relatedTo : undefined);
  const { anime: relatedAnchorAnime } = useAnimeDetail(
    isRelatedView ? relatedTo : undefined,
  );
  const seoTitle = isRecommendedView
    ? `Anime recommended from ${anchorAnime?.name ?? "Rekko"}`
    : isRelatedView
      ? `Anime related to ${relatedAnchorAnime?.name ?? "Rekko"}`
      : selectedGenre
        ? `${selectedGenre} anime`
        : activeTab === "View All"
          ? seoPages.animes.title
          : `${activeTab} catalogue`;
  const seoDescription = isRecommendedView
    ? `Discover anime recommendations based on ${anchorAnime?.name ?? "a selected anime"} on Rekko.`
    : isRelatedView
      ? `Browse anime related to ${relatedAnchorAnime?.name ?? "a selected anime"} on Rekko.`
      : selectedGenre
        ? `Browse ${selectedGenre} anime in the Rekko catalogue.`
        : seoPages.animes.description;
  const seoPath = `/animes${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const filterProperties = useMemo<FilterProperty[]>(
    () => [
      { key: "genre", label: "Genre", options: genres },
      { key: "type", label: "Type", options: STATIC_TYPE_OPTIONS },
      { key: "status", label: "Status", options: STATIC_STATUS_OPTIONS },
    ],
    [genres],
  );

  // Keep pages full: limit is the largest multiple of visible columns <= backend max.
  useEffect(() => {
    if (Number(urlLimit) !== responsiveLimit) {
      updateParams({ limit: String(responsiveLimit) }, { resetPage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsiveLimit]);

  // Cargar géneros desde el backend al montar (reemplaza el fallback estático)
  useEffect(() => {
    getGenres()
      .then((names) =>
        setGenres(names.map((name) => ({ value: name, label: name }))),
      )
      .catch((err) => {
        console.warn(
          "[Rekko] getGenres failed, using static fallback:",
          err?.message ?? err,
        );
      });
  }, []);

  function handleTabChange(tab: string) {
    setSelectedGenre(null);
    // Reset filtros al cambiar tab; mantener adv y limit
    const next = new URLSearchParams();
    next.set("tab", TAB_TO_URL[tab] ?? "all");
    if (advOpen) next.set("adv", "1");
    setSearchParams(next, { replace: false });
  }

  function handleGenreCardClick(genreName: string) {
    setSelectedGenre(genreName);
    updateParams({ genre: genreName }, { resetPage: true });
  }

  function handleBackToGenres() {
    setSelectedGenre(null);
    updateParams({ genre: null }, { resetPage: true });
  }

  function handleAdvancedFilter() {
    const patch: Record<string, string | null> = {
      genre: advValues.genres.length > 0 ? advValues.genres.join(",") : null,
      ratingMin: advValues.ratingMin > 0 ? String(advValues.ratingMin) : null,
      ratingMax: advValues.ratingMax < 10 ? String(advValues.ratingMax) : null,
      episodesMin:
        advValues.episodesMin !== undefined
          ? String(advValues.episodesMin)
          : null,
      episodesMax:
        advValues.episodesMax !== undefined
          ? String(advValues.episodesMax)
          : null,
      season: advValues.seasonKey ?? null,
      type: advValues.type ?? null,
    };
    updateParams(patch, { resetPage: true });
  }

  function handleQuickFilter(rows: { property: string; value: string }[]) {
    const patch: Record<string, string | null> = {
      genre: null,
      type: null,
      status: null,
    };
    for (const row of rows) {
      if (!row.property || !row.value) continue;
      if (row.property === "genre") patch.genre = row.value;
      if (row.property === "type") patch.type = row.value;
      if (row.property === "status") patch.status = row.value;
    }
    updateParams(patch, { resetPage: true });
  }

  function handlePageChange(page: number) {
    updateParams({ page: String(page) });
  }

  function toggleAdv() {
    if (advOpen) {
      updateParams({ adv: null });
    } else {
      updateParams({ adv: "1" });
    }
  }

  // ─── Recommended view branch ──────────────────────────────────────────
  if (isRecommendedView) {
    return (
      <div className={styles.page}>
        <Seo
          title={seoTitle}
          description={seoDescription}
          canonicalPath={seoPath}
          jsonLd={[
            pageJsonLd({
              type: "CollectionPage",
              path: seoPath,
              name: seoTitle,
              description: seoDescription,
            }),
            itemListJsonLd(
              seoTitle,
              seoPath,
              recommendedAnimes.slice(0, 24).map((anime) => ({
                name: anime.name,
                url: `/animes/${anime.malId}`,
                image: anime.imgMedium || anime.imgLarge,
              })),
            ),
          ]}
        />
        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.breadcrumb}>
              <a
                href="/animes"
                className="text-primary hover:underline font-semibold"
              >
                ← Catálogo
              </a>
              <span className="text-text-muted">/</span>
              <span className="font-semibold text-text-main">
                Recommended based on {anchorAnime?.name ?? "…"}
              </span>
            </div>
            {recommendedLoading && <p className={styles.loading}>Loading...</p>}
            {recommendedError && (
              <p className={styles.error}>{recommendedError}</p>
            )}
            {!recommendedLoading &&
              !recommendedError &&
              recommendedAnimes.length === 0 && (
                <p className={styles.loading}>
                  No recommendations available yet.
                </p>
              )}
            {!recommendedLoading &&
              !recommendedError &&
              recommendedAnimes.map((anime) => (
                <AnimeCard key={anime.malId} anime={anime} />
              ))}
          </div>
        </div>
        {recommendedPagination && recommendedPagination.pages > 1 && (
          <Pagination
            currentPage={recommendedPagination.page}
            totalPages={recommendedPagination.pages}
            onPageChange={setRecommendedPage}
          />
        )}
      </div>
    );
  }

  if (isRelatedView) {
    const relatedAnimes = relatedRelations.map(relationToAnime);

    return (
      <div className={styles.page}>
        <Seo
          title={seoTitle}
          description={seoDescription}
          canonicalPath={seoPath}
          jsonLd={[
            pageJsonLd({
              type: "CollectionPage",
              path: seoPath,
              name: seoTitle,
              description: seoDescription,
            }),
            itemListJsonLd(
              seoTitle,
              seoPath,
              relatedAnimes.slice(0, 24).map((anime) => ({
                name: anime.name,
                url: `/animes/${anime.malId}`,
                image: anime.imgMedium || anime.imgLarge,
              })),
            ),
          ]}
        />
        <div className={styles.body}>
          <div className={styles.grid}>
            <div className={styles.breadcrumb}>
              <a
                href="/animes"
                className="text-primary hover:underline font-semibold"
              >
                ← Catálogo
              </a>
              <span className="text-text-muted">/</span>
              <span className="font-semibold text-text-main">
                Related to {relatedAnchorAnime?.name ?? "…"}
              </span>
            </div>
            {relatedLoading && <p className={styles.loading}>Loading...</p>}
            {relatedError && <p className={styles.error}>{relatedError}</p>}
            {!relatedLoading && !relatedError && relatedAnimes.length === 0 && (
              <p className={styles.loading}>No related animes available yet.</p>
            )}
            {!relatedLoading &&
              !relatedError &&
              relatedAnimes.map((anime) => (
                <AnimeCard key={anime.malId} anime={anime} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={seoPath}
        jsonLd={[
          pageJsonLd({
            type: "CollectionPage",
            path: seoPath,
            name: seoTitle,
            description: seoDescription,
          }),
          itemListJsonLd(
            seoTitle,
            seoPath,
            animes.slice(0, 24).map((anime) => ({
              name: anime.name,
              url: `/animes/${anime.malId}`,
              image: anime.imgMedium || anime.imgLarge,
            })),
          ),
        ]}
      />
      {/* Sticky control bar — SubNav + QuickFilter scroll with the page header */}
      <div className="sticky top-[62px] z-20 bg-app-bg lg:top-[136px]">
        <SubNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onToggleFilter={toggleAdv}
          filterOpen={advOpen}
        />

        {/* Filtros mutuamente excluyentes: solo uno visible a la vez */}
        {!advOpen && !(activeTab === "By Genre" && !selectedGenre) && (
          <QuickFilter
            properties={filterProperties}
            onApply={handleQuickFilter}
            onOpenAdvanced={toggleAdv}
          />
        )}

        {/* Separator inset to match nav margins */}
        <div className="h-px bg-border mx-4 md:mx-[6%]" />
      </div>

      <div className={styles.body}>
        {/* By Genre — vista de selección de género agrupada por letra */}
        {activeTab === "By Genre" && !selectedGenre ? (
          <div className={styles.letterGrid}>
            {(() => {
              const grouped = genres.reduce<Record<string, typeof genres>>(
                (acc, g) => {
                  const letter = g.label[0].toUpperCase();
                  (acc[letter] ??= []).push(g);
                  return acc;
                },
                {},
              );
              return Object.keys(grouped)
                .sort()
                .map((letter) => (
                  <div key={letter} className={styles.letterBox}>
                    <div className={styles.letterBadge}>{letter}</div>
                    {grouped[letter].map((g) => (
                      <button
                        key={g.value}
                        className={styles.genreLink}
                        onClick={() => handleGenreCardClick(g.value)}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                ));
            })()}
          </div>
        ) : (
          <>
            {loading && <p className={styles.loading}>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {!loading && !error && (
              <div className={styles.grid}>
                {selectedGenre && (
                  <div className={styles.breadcrumb}>
                    <button
                      onClick={handleBackToGenres}
                      className="text-primary hover:underline font-semibold"
                    >
                      ← Géneros
                    </button>
                    <span className="text-text-muted">/</span>
                    <span className="font-semibold text-text-main">
                      {selectedGenre}
                    </span>
                  </div>
                )}
                {animes.map((anime) => (
                  <AnimeCard key={anime.malId} anime={anime} />
                ))}
              </div>
            )}
          </>
        )}

        {advOpen && (
          <AdvancedFilterPanel
            availableGenres={genres}
            seasonOptions={SEASON_OPTIONS}
            values={advValues}
            onValuesChange={setAdvValues}
            onApply={handleAdvancedFilter}
            onClose={() => updateParams({ adv: null })}
          />
        )}
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
