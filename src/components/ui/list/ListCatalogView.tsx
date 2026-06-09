import { Star, Film, Tv, Calendar, Radio } from 'lucide-react';
import type { UserListEntry, ListState } from '@/hooks/useUserList';

const STATE_CONFIG: Record<ListState, { label: string; wrap: string; text: string }> = {
  WATCHING:      { label: 'Watching',       wrap: 'bg-status-blue/15',  text: 'text-status-blue'  },
  COMPLETED:     { label: 'Completed',      wrap: 'bg-status-green/15', text: 'text-status-green' },
  ON_HOLD:       { label: 'On Hold',        wrap: 'bg-primary/15',      text: 'text-primary'      },
  DROPPED:       { label: 'Dropped',        wrap: 'bg-status-red/15',   text: 'text-status-red'   },
  PLAN_TO_WATCH: { label: 'Plan to Watch',  wrap: 'bg-black/5',         text: 'text-[#888]'       },
};

const AIRING_LABELS: Record<string, string> = {
  finished_airing:  'Finished',
  currently_airing: 'Airing',
  not_yet_aired:    'Upcoming',
};

const styles = {
  empty:       'flex flex-col items-center justify-center py-24 text-text-secondary font-gabarito',
  emptyIcon:   'opacity-20 mb-4',
  emptyText:   'text-lg',
  grid:        'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4',
  card:        'flex gap-0 bg-white rounded-card shadow-card overflow-hidden cursor-pointer group border border-border hover:border-primary/40 transition-colors duration-200',
  cover:       'relative flex-shrink-0 w-[90px] overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900',
  coverImg:    'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
  coverFb:     'w-full h-full flex items-center justify-center min-h-[130px]',
  coverFbIcon: 'text-white/30',
  body:        'flex flex-col flex-1 p-3 min-w-0 gap-2',
  topRow:      'flex items-start justify-between gap-2',
  title:       'text-[13px] font-semibold text-text-main leading-tight line-clamp-2 flex-1',
  stateBadge:  'shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full',
  metaRow:     'flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-secondary',
  metaItem:    'flex items-center gap-1',
  progressWrap:'space-y-1',
  progressTop: 'flex items-center justify-between text-[11px] text-text-secondary',
  progressPct: 'text-[10px] font-medium text-primary',
  progressBar: 'h-[4px] rounded-full bg-border overflow-hidden',
  progressFill:'h-full bg-primary rounded-full transition-all duration-300',
  scoreRow:    'flex items-center gap-3 mt-auto',
  scoreStar:   'flex items-center gap-1 text-[12px] font-semibold text-text-main',
  scoreNone:   'text-[11px] text-text-secondary',
  malScore:    'text-[11px] text-text-secondary',
  malScoreVal: 'font-medium text-text-main',
  capitalize:  'capitalize',
  epSuffix:    'text-text-muted',
  starIcon:    'text-primary',
};

interface Props {
  entries: UserListEntry[];
  onEdit?: (entry: UserListEntry) => void;
}

export default function ListCatalogView({ entries, onEdit }: Props) {
  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <Film size={48} className={styles.emptyIcon} />
        <p className={styles.emptyText}>No anime here yet</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {entries.map((entry) => (
        <CatalogCard key={entry.userWatchAnimeId} entry={entry} onEdit={onEdit} />
      ))}
    </div>
  );
}

function CatalogCard({ entry, onEdit }: { entry: UserListEntry; onEdit?: (e: UserListEntry) => void }) {
  const cfg = STATE_CONFIG[entry.state];
  const isMovie = entry.mediaType === 'movie';
  const progress = entry.numEpisodesTotal > 0
    ? Math.round((entry.numEpisodesWatched / entry.numEpisodesTotal) * 100)
    : null;
  const airingLabel = AIRING_LABELS[entry.animeStatus] ?? entry.animeStatus;
  const hasBroadcast = !isMovie && entry.broadcast?.dayOfWeek && entry.broadcast.dayOfWeek !== 'Unknown';

  return (
    <div className={styles.card} onClick={() => onEdit?.(entry)}>
      <div className={styles.cover}>
        {entry.imgMedium ? (
          <img src={entry.imgMedium} alt={entry.name} className={styles.coverImg} />
        ) : (
          <div className={styles.coverFb}>
            {isMovie
              ? <Film size={24} className={styles.coverFbIcon} />
              : <Tv   size={24} className={styles.coverFbIcon} />
            }
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <h3 className={styles.title}>{entry.name}</h3>
          <span className={`${styles.stateBadge} ${cfg.wrap} ${cfg.text}`}>{cfg.label}</span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            {isMovie ? <Film size={10} /> : <Tv size={10} />}
            <span className={styles.capitalize}>{entry.mediaType.replace(/_/g, ' ')}</span>
          </span>
          <span className={styles.metaItem}>
            <Calendar size={10} />
            {airingLabel}
          </span>
          {hasBroadcast && (
            <span className={styles.metaItem}>
              <Radio size={10} />
              {entry.broadcast.dayOfWeek}s
            </span>
          )}
        </div>

        {entry.numEpisodesTotal > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressTop}>
              <span>
                {entry.numEpisodesWatched}
                <span className={styles.epSuffix}>/{entry.numEpisodesTotal} ep</span>
              </span>
              {progress !== null && <span className={styles.progressPct}>{progress}%</span>}
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress ?? 0}%` }} />
            </div>
          </div>
        )}

        <div className={styles.scoreRow}>
          {entry.userRate !== null ? (
            <span className={styles.scoreStar}>
              <Star size={12} fill="#FF9E00" className={styles.starIcon} />
              {entry.userRate}/10
            </span>
          ) : (
            <span className={styles.scoreNone}>Not rated</span>
          )}
          {entry.malMean > 0 && (
            <span className={styles.malScore}>
              MAL <span className={styles.malScoreVal}>{entry.malMean.toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
