import { useState } from 'react';
import AnimeCard from '@/components/ui/anime/AnimeCard';
import SubNav from '@/components/ui/filter/SubNav';
import QuickFilter, { FilterProperty } from '@/components/ui/filter/QuickFilter';
import AdvancedFilterPanel, { AdvancedFilterValues } from '@/components/ui/filter/AdvancedFilterPanel';
import Pagination from '@/components/ui/common/Pagination';

interface Anime {
  id: string;
  title: string;
  cover?: string;
  score?: number;
  views?: string;
  members?: string;
  favorites?: string;
}

const MOCK_ANIMES: Anime[] = [
  { id: '1', title: 'Frieren: Beyond Journey\'s End',          score: 9.14, views: '1.7M', members: '2.1M', favorites: '180K' },
  { id: '2', title: 'Frieren: Beyond Journey\'s End Season 2', score: 9.02, views: '1.2M', members: '1.8M', favorites: '140K' },
  { id: '3', title: 'Steins;Gate',                              score: 9.10, views: '2.3M', members: '3.1M', favorites: '310K' },
  { id: '4', title: 'Jujutsu Kaisen',                           score: 8.50, views: '3.2M', members: '4.0M', favorites: '420K' },
  { id: '5', title: 'Fullmetal Alchemist: Brotherhood',         score: 9.08, views: '2.8M', members: '3.5M', favorites: '390K' },
  { id: '6', title: 'Vinland Saga',                             score: 8.72, views: '1.4M', members: '2.0M', favorites: '160K' },
];

// Preparado para venir del backend
const FILTER_PROPERTIES: FilterProperty[] = [
  {
    key: 'genre',
    label: 'Genre',
    options: [
      { value: 'action',  label: 'Action'  },
      { value: 'fantasy', label: 'Fantasy' },
      { value: 'sci-fi',  label: 'Sci-Fi'  },
      { value: 'seinen',  label: 'Seinen'  },
      { value: 'romance', label: 'Romance' },
      { value: 'comedy',  label: 'Comedy'  },
    ],
  },
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'tv',      label: 'TV'      },
      { value: 'movie',   label: 'Movie'   },
      { value: 'ova',     label: 'OVA'     },
      { value: 'ona',     label: 'ONA'     },
      { value: 'special', label: 'Special' },
    ],
  },
  {
    key: 'season',
    label: 'Season',
    options: [
      { value: 'spring', label: 'Spring' },
      { value: 'summer', label: 'Summer' },
      { value: 'fall',   label: 'Fall'   },
      { value: 'winter', label: 'Winter' },
    ],
  },
];

// Géneros disponibles para el advanced filter (vendrán del backend)
const AVAILABLE_GENRES = FILTER_PROPERTIES[0].options.map(o => ({ value: o.value, label: o.label }));

const styles = {
  page: 'flex flex-col font-gabarito min-h-full pt-4',
  body: 'flex gap-4 px-[6%] pb-8',
  grid: 'flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-4',
};

export default function Animes() {
  const [activeTab,   setActiveTab]   = useState('View All');
  const [showAdv,     setShowAdv]     = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Preparado para conectar con el backend
  const [_quickFilters, setQuickFilters] = useState<{ property: string; value: string }[]>([]);
  const [_advFilters,   setAdvFilters]   = useState<AdvancedFilterValues | null>(null);

  const totalPages = 100; // vendrá del backend
  const animes     = MOCK_ANIMES; // vendrá del backend / hook

  return (
    <div className={styles.page}>
      <SubNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleFilter={() => setShowAdv(v => !v)}
        filterOpen={showAdv}
      />

      <QuickFilter
        properties={FILTER_PROPERTIES}
        onApply={setQuickFilters}
        onOpenAdvanced={() => setShowAdv(v => !v)}
      />

      <div className={styles.body}>
        <div className={styles.grid}>
          {animes.map(a => (
            <AnimeCard key={a.id} {...a} />
          ))}
        </div>

        {showAdv && (
          <AdvancedFilterPanel
            availableGenres={AVAILABLE_GENRES}
            onApply={setAdvFilters}
            onClose={() => setShowAdv(false)}
          />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
