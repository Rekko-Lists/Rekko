import { useState, useMemo } from 'react';
import {
  LayoutGrid, AlignJustify, BookOpen,
  AlertCircle, RefreshCw,
  Check, Eye, Clock, X, Pause,
  type LucideIcon,
} from 'lucide-react';
import Seo from '@/components/seo/Seo';
import { itemListJsonLd, pageJsonLd } from '@/components/seo/jsonLd';
import { seoPages } from '@/components/seo/pages';
import { useUserList, type ListState, type UserListEntry } from '@/hooks/useUserList';
import ListCardView from '@/components/ui/list/ListCardView';
import ListCatalogView from '@/components/ui/list/ListCatalogView';
import ListTableView from '@/components/ui/list/ListTableView';
import ListEditModal from '@/components/ui/list/ListEditModal';
import { useAuthStore } from '@/store/useAuthStore';
import type { WatchState } from '@/types/anime';

// ─── Types ─────────────────────────────────────────────────────────────────

type ViewMode  = 'cards' | 'catalog' | 'list';
type TabFilter = 'all' | ListState;

// ─── Config arrays ─────────────────────────────────────────────────────────

const VIEW_MODES: { id: ViewMode; Icon: LucideIcon; label: string }[] = [
  { id: 'cards',   Icon: LayoutGrid,   label: 'Cards'   },
  { id: 'catalog', Icon: BookOpen,     label: 'Catalog' },
  { id: 'list',    Icon: AlignJustify, label: 'List'    },
];

const STATUS_TABS: { id: TabFilter; label: string; Icon: LucideIcon }[] = [
  { id: 'all',           label: 'All',           Icon: LayoutGrid },
  { id: 'WATCHING',      label: 'Watching',      Icon: Eye        },
  { id: 'COMPLETED',     label: 'Completed',     Icon: Check      },
  { id: 'ON_HOLD',       label: 'On Hold',       Icon: Pause      },
  { id: 'DROPPED',       label: 'Dropped',       Icon: X          },
  { id: 'PLAN_TO_WATCH', label: 'Plan to Watch', Icon: Clock      },
];

const STATE_ACCENT: Partial<Record<TabFilter, string>> = {
  WATCHING:      'text-status-blue',
  COMPLETED:     'text-status-green',
  ON_HOLD:       'text-primary',
  DROPPED:       'text-status-red',
  PLAN_TO_WATCH: 'text-[#888]',
};

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = {
  page:          'px-[6%] py-6 font-gabarito min-h-screen',
  header:        'mb-6',
  titleRow:      'flex items-baseline gap-2 mb-1',
  title:         'text-[40px] font-semibold text-text-main leading-none',
  titleDash:     'text-[28px] text-text-secondary font-semibold leading-none',
  statsRow:      'flex items-center gap-5 mt-3',
  statItem:      'flex flex-col items-center',
  statCount:     'text-xl font-semibold leading-none',
  statLabel:     'text-[11px] text-text-secondary mt-0.5 whitespace-nowrap',
  divider:       'w-px h-8 bg-border',
  controls:      'flex items-center justify-between gap-4 mb-5 flex-wrap',
  tabRow:        'flex items-center border-b border-border',
  tabBtn:        'relative pb-2 px-3 text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 text-text-secondary hover:text-text-main',
  tabBtnActive:  'relative pb-2 px-3 text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 font-semibold text-text-main',
  tabUnderline:  'absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full',
  tabCount:      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
  tabCountActive:'bg-primary text-white',
  tabCountIdle:  'bg-border text-text-secondary',
  modeSwitcher:  'flex items-center gap-0.5 bg-white border border-border rounded-[6px] p-0.5',
  modeBtn:       'flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-all text-text-secondary hover:text-text-main',
  modeBtnActive: 'flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all bg-[#212834] text-white',
  modeBtnLabel:  'hidden sm:inline',
  errorWrap:     'flex flex-col items-center justify-center py-24 gap-3 text-center',
  errorIcon:     'text-status-red opacity-60',
  errorText:     'text-text-secondary text-sm',
  retryBtn:      'flex items-center gap-1.5 text-sm font-medium text-primary hover:underline',
  tableWrap:     'bg-white rounded-card shadow-card overflow-hidden',
  // skeleton
  skGrid:        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
  skCatalog:     'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4',
  skCard:        'rounded-card overflow-hidden bg-white shadow-card animate-pulse',
  skPoster:      'aspect-[2/3] bg-gradient-to-br from-slate-200 to-slate-300',
  skCardBody:    'p-2 space-y-1.5',
  skLine1:       'h-2.5 bg-slate-200 rounded w-3/4',
  skLine2:       'h-1.5 bg-slate-100 rounded w-full',
  skCatItem:     'flex gap-0 bg-white rounded-card shadow-card overflow-hidden animate-pulse h-[120px]',
  skCatCover:    'w-[90px] bg-slate-200 flex-shrink-0',
  skCatBody:     'flex-1 p-3 space-y-2',
  skCatLine1:    'h-3 bg-slate-200 rounded w-3/4',
  skCatLine2:    'h-2 bg-slate-100 rounded w-1/3',
  skTableWrap:   'bg-white rounded-card shadow-card overflow-hidden',
  skRow:         'flex items-center gap-3 py-2 px-3 animate-pulse border-b border-border-light',
  skThumb:       'w-[46px] h-[62px] rounded bg-slate-200 flex-shrink-0',
  skRowBody:     'flex-1 space-y-2',
  skRowLine1:    'h-3 bg-slate-200 rounded w-1/2',
  skRowLine2:    'h-2 bg-slate-100 rounded w-1/3',
  skRowRight1:   'h-3 bg-slate-200 rounded w-16 hidden sm:block',
  skRowRight2:   'h-2 bg-slate-100 rounded w-20 hidden md:block',
};

// ─── Skeleton ──────────────────────────────────────────────────────────────

function LoadingSkeleton({ mode }: { mode: ViewMode }) {
  if (mode === 'list') {
    return (
      <div className={styles.skTableWrap}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skRow}>
            <div className={styles.skThumb} />
            <div className={styles.skRowBody}>
              <div className={styles.skRowLine1} />
              <div className={styles.skRowLine2} />
            </div>
            <div className={styles.skRowRight1} />
            <div className={styles.skRowRight2} />
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'catalog') {
    return (
      <div className={styles.skCatalog}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skCatItem}>
            <div className={styles.skCatCover} />
            <div className={styles.skCatBody}>
              <div className={styles.skCatLine1} />
              <div className={styles.skCatLine2} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.skGrid}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={styles.skCard}>
          <div className={styles.skPoster} />
          <div className={styles.skCardBody}>
            <div className={styles.skLine1} />
            <div className={styles.skLine2} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stat badge ────────────────────────────────────────────────────────────

function StatBadge({ count, label, countClass }: { count: number; label: string; countClass: string }) {
  return (
    <div className={styles.statItem}>
      <span className={`${styles.statCount} ${countClass}`}>{count}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function List() {
  const user = useAuthStore((s) => s.user);
  const { entries, loading, error, refresh, updateState, updateRating, deleteEntry } = useUserList();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [viewMode,  setViewMode]  = useState<ViewMode>('cards');
  const [editEntry, setEditEntry] = useState<UserListEntry | null>(null);

  const counts = useMemo(() => {
    const map: Partial<Record<ListState, number>> = {};
    for (const e of entries) map[e.state] = (map[e.state] ?? 0) + 1;
    return map;
  }, [entries]);

  const filtered = useMemo(
    () => activeTab === 'all' ? entries : entries.filter((e) => e.state === activeTab),
    [entries, activeTab],
  );

  const seoItems = filtered.map((e) => ({ name: e.name, url: '/list' }));

  return (
    <div className={styles.page}>
      <Seo
        title={seoPages.list.title}
        description={seoPages.list.description}
        canonicalPath={seoPages.list.path}
        noindex={seoPages.list.noindex}
        jsonLd={[
          pageJsonLd({
            type: seoPages.list.schemaType,
            path: seoPages.list.path,
            name: seoPages.list.title,
            description: seoPages.list.description,
          }),
          itemListJsonLd('My Rekko anime list', seoPages.list.path, seoItems),
        ]}
      />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            {user?.username ? `${user.username}'s List` : 'My List'}
          </h1>
          {!loading && entries.length > 0 && (
            <span className={styles.titleDash}>—</span>
          )}
        </div>

        {!loading && entries.length > 0 && (
          <div className={styles.statsRow}>
            <StatBadge count={entries.length}          label="Total"         countClass="text-text-main"    />
            <div className={styles.divider} />
            <StatBadge count={counts.WATCHING ?? 0}      label="Watching"      countClass="text-status-blue"  />
            <StatBadge count={counts.COMPLETED ?? 0}     label="Completed"     countClass="text-status-green" />
            <StatBadge count={counts.ON_HOLD ?? 0}       label="On Hold"       countClass="text-primary"      />
            <StatBadge count={counts.DROPPED ?? 0}       label="Dropped"       countClass="text-status-red"   />
            <StatBadge count={counts.PLAN_TO_WATCH ?? 0} label="Plan to Watch" countClass="text-[#888]"       />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.tabRow}>
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = activeTab === id;
            const count = id === 'all' ? entries.length : (counts[id as ListState] ?? 0);
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={isActive ? styles.tabBtnActive : styles.tabBtn}
              >
                <span className={isActive ? (STATE_ACCENT[id] ?? 'text-text-main') : ''}>
                  {label}
                </span>
                {count > 0 && (
                  <span className={`${styles.tabCount} ${isActive ? styles.tabCountActive : styles.tabCountIdle}`}>
                    {count}
                  </span>
                )}
                {isActive && <span className={styles.tabUnderline} />}
              </button>
            );
          })}
        </div>

        <div className={styles.modeSwitcher}>
          {VIEW_MODES.map(({ id, Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => setViewMode(id)}
              className={viewMode === id ? styles.modeBtnActive : styles.modeBtn}
            >
              <Icon size={13} />
              <span className={styles.modeBtnLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className={styles.errorWrap}>
          <AlertCircle size={40} className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => refresh()} className={styles.retryBtn}>
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      ) : loading ? (
        <LoadingSkeleton mode={viewMode} />
      ) : viewMode === 'cards' ? (
        <ListCardView entries={filtered} onEdit={setEditEntry} />
      ) : viewMode === 'catalog' ? (
        <ListCatalogView entries={filtered} onEdit={setEditEntry} />
      ) : (
        <div className={styles.tableWrap}>
          <ListTableView entries={filtered} onEdit={setEditEntry} />
        </div>
      )}

      {/* Edit modal */}
      {editEntry && (
        <ListEditModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onUpdateState={async (malId, state, episodes) => {
            await updateState(malId, state as WatchState, episodes);
          }}
          onUpdateRating={async (malId, rating) => {
            await updateRating(malId, rating);
          }}
          onDelete={async (malId, hasRating) => {
            await deleteEntry(malId, hasRating);
          }}
        />
      )}
    </div>
  );
}
