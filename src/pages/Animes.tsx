import { useState, useEffect, useMemo } from 'react';
import AnimeCard from '@/components/ui/anime/AnimeCard';
import SubNav from '@/components/ui/filter/SubNav';
import QuickFilter, { FilterProperty } from '@/components/ui/filter/QuickFilter';
import AdvancedFilterPanel, { AdvancedFilterValues, INITIAL_FILTER_VALUES } from '@/components/ui/filter/AdvancedFilterPanel';
import Pagination from '@/components/ui/common/Pagination';
import { useAnimeCatalogue } from '@/hooks/useAnimeCatalogue';
import type { GetAnimesParams } from '@/lib/animeService';
import { getGenres } from '@/lib/animeService';
import { computeSeasonOptions } from '@/lib/seasonUtils';

const DEFAULT_TYPE_FILTER = { 'mediaType[in]': 'tv,ova,movie' } as const;

// Params por tab — sort + filtros de una vez para evitar doble efecto
const TAB_CONFIG: Record<string, Partial<GetAnimesParams>> = {
  'View All': {
    sort: [{ field: 'malMean', order: 'desc' }],
    filters: { ...DEFAULT_TYPE_FILTER },
  },
  'Top Anime': {
    sort: [{ field: 'malRank', order: 'asc' }],
    filters: { 'malRank[ne]': 0, 'malRank[lte]': 500, ...DEFAULT_TYPE_FILTER },
  },
  'Seasonal Anime': {
    sort: [{ field: 'startDate', order: 'desc' }],
    filters: { 'status[eq]': 'currently_airing', ...DEFAULT_TYPE_FILTER },
  },
  'By Genre': {},
};

// Opciones de temporada — computadas una sola vez al cargar el módulo
const SEASON_OPTIONS = computeSeasonOptions();

const STATIC_TYPE_OPTIONS = [
  { value: 'tv',    label: 'TV'    },
  { value: 'movie', label: 'Movie' },
  { value: 'ova',   label: 'OVA'  },
];

const STATIC_STATUS_OPTIONS = [
  { value: 'currently_airing', label: 'Airing'   },
  { value: 'finished_airing',  label: 'Finished' },
  { value: 'not_yet_aired',    label: 'Upcoming' },
];

const AVAILABLE_GENRES = [
  { value: 'Action',    label: 'Action'    },
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Comedy',    label: 'Comedy'    },
  { value: 'Drama',     label: 'Drama'     },
  { value: 'Fantasy',   label: 'Fantasy'   },
  { value: 'Romance',   label: 'Romance'   },
];

const styles = {
  page:         'flex flex-col font-gabarito min-h-full pt-4',
  body:         'flex gap-2 px-[6%] pb-8',
  grid:         'flex-1 flex flex-wrap gap-4 pt-4 content-start',
  loading:      'flex-1 flex items-center justify-center text-text-muted py-20',
  error:        'flex-1 flex items-center justify-center text-status-red py-20',
  letterGrid:   'flex-1 pt-4 grid grid-cols-3 gap-5',
  letterBox:    'bg-surface border-[1.5px] border-border rounded-card px-6 py-5 flex flex-col',
  letterBadge:  'text-primary font-bold text-base mb-3 pb-2 border-b border-border-light text-center',
  genreLink:    'block w-full text-sm text-text-main hover:text-primary cursor-pointer py-2 transition-colors text-center',
  breadcrumb:   'w-full flex items-center gap-1.5 pb-2 mb-1 text-xs',
};

export default function Animes() {
  const [activeTab,     setActiveTab]     = useState('View All');
  const [showAdv,       setShowAdv]       = useState(false);
  const [genres,        setGenres]        = useState<{ value: string; label: string }[]>(AVAILABLE_GENRES);
  const [advValues,     setAdvValues]     = useState<AdvancedFilterValues>(INITIAL_FILTER_VALUES);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { animes, pagination, loading, error, setPage, setLimit, resetParams } =
    useAnimeCatalogue(TAB_CONFIG['View All'] as GetAnimesParams);

  const filterProperties = useMemo<FilterProperty[]>(() => [
    { key: 'genre', label: 'Genre', chipGrid: true, options: genres },
    { key: 'type',  label: 'Type',  options: STATIC_TYPE_OPTIONS   },
    { key: 'status',label: 'Status',options: STATIC_STATUS_OPTIONS },
  ], [genres]);

  // Ajustar límite cuando se abre/cierra el panel avanzado
  useEffect(() => {
    setLimit(showAdv ? 108 : 110);
  }, [showAdv]);

  // Cargar géneros desde el backend al montar (reemplaza el fallback estático)
  useEffect(() => {
    getGenres()
      .then(names => setGenres(names.map(name => ({ value: name, label: name }))))
      .catch((err) => {
        console.warn('[Rekko] getGenres failed, using static fallback:', err?.message ?? err);
      });
  }, []);

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setSelectedGenre(null);
    resetParams({ ...TAB_CONFIG[tab], limit: showAdv ? 108 : 110 });
  }

  function handleGenreCardClick(genreName: string) {
    setSelectedGenre(genreName);
    resetParams({
      sort: [{ field: 'malMean', order: 'desc' }],
      filters: { 'genres[eq]': genreName },
      limit: showAdv ? 108 : 110,
    });
  }

  function handleBackToGenres() {
    setSelectedGenre(null);
  }

  function handleAdvancedFilter() {
    const filters: GetAnimesParams['filters'] = {};

    if (advValues.genres.length > 0) {
      filters['genres[eq]'] = advValues.genres.join(',');
    }

    if (advValues.ratingMin > 0)  filters['malMean[gte]'] = advValues.ratingMin;
    if (advValues.ratingMax < 10) filters['malMean[lte]'] = advValues.ratingMax;

    if (advValues.episodesMin !== undefined) filters['numEpisodes[gte]'] = advValues.episodesMin;
    if (advValues.episodesMax !== undefined) filters['numEpisodes[lte]'] = advValues.episodesMax;

    if (advValues.seasonKey) {
      const season = SEASON_OPTIONS.find(s => s.value === advValues.seasonKey);
      if (season) {
        filters['startDate[gte]'] = season.gte;
        if (season.lt) filters['startDate[lt]'] = season.lt;
      }
    }

    resetParams({
      ...TAB_CONFIG[activeTab],
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: showAdv ? 108 : 110,
    });
  }

  function handleQuickFilter(rows: { property: string; value: string }[]) {
    const filters: GetAnimesParams['filters'] = {};

    for (const row of rows) {
      if (!row.property || !row.value) continue;
      if (row.property === 'genre') {
        filters['genres[eq]'] = row.value;
      } else if (row.property === 'type') {
        filters['mediaType[eq]'] = row.value;
      } else if (row.property === 'status') {
        filters['status[eq]'] = row.value;
      }
    }

    resetParams({
      ...TAB_CONFIG[activeTab],
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: showAdv ? 108 : 110,
    });
  }

  return (
    <div className={styles.page}>
      <SubNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onToggleFilter={() => setShowAdv(v => !v)}
        filterOpen={showAdv}
      />

      {!(activeTab === 'By Genre' && !selectedGenre) && (
        <QuickFilter
          properties={filterProperties}
          onApply={handleQuickFilter}
          onOpenAdvanced={() => setShowAdv(v => !v)}
        />
      )}

      <div className={styles.body}>
        {/* By Genre — vista de selección de género agrupada por letra */}
        {activeTab === 'By Genre' && !selectedGenre ? (
          <div className={styles.letterGrid}>
            {(() => {
              const grouped = genres.reduce<Record<string, typeof genres>>((acc, g) => {
                const letter = g.label[0].toUpperCase();
                (acc[letter] ??= []).push(g);
                return acc;
              }, {});
              return Object.keys(grouped).sort().map(letter => (
                <div key={letter} className={styles.letterBox}>
                  <div className={styles.letterBadge}>{letter}</div>
                  {grouped[letter].map(g => (
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
            {error   && <p className={styles.error}>{error}</p>}

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
                    <span className="font-semibold text-text-main">{selectedGenre}</span>
                  </div>
                )}
                {animes.map(anime => (
                  <AnimeCard key={anime.malId} anime={anime} />
                ))}
              </div>
            )}
          </>
        )}

        {showAdv && (
          <AdvancedFilterPanel
            availableGenres={genres}
            seasonOptions={SEASON_OPTIONS}
            values={advValues}
            onValuesChange={setAdvValues}
            onApply={handleAdvancedFilter}
            onClose={() => setShowAdv(false)}
          />
        )}
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
