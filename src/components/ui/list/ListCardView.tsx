import { Star, Film, Tv } from 'lucide-react';
import type { UserListEntry, ListState } from '@/hooks/useUserList';

const STATE_CONFIG: Record<ListState, { label: string; badge: string }> = {
  WATCHING:      { label: 'Watching',       badge: 'bg-status-blue'  },
  COMPLETED:     { label: 'Completed',      badge: 'bg-status-green' },
  ON_HOLD:       { label: 'On Hold',        badge: 'bg-primary'      },
  DROPPED:       { label: 'Dropped',        badge: 'bg-status-red'   },
  PLAN_TO_WATCH: { label: 'Plan to Watch',  badge: 'bg-[#888888]'   },
};

const styles = {
  empty:        'flex flex-col items-center justify-center py-24 text-text-secondary font-gabarito',
  emptyIcon:    'opacity-20 mb-4',
  emptyText:    'text-lg',
  grid:         'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
  card:         'group relative rounded-card overflow-hidden bg-white shadow-card cursor-pointer',
  poster:       'relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900',
  posterImg:    'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
  posterFb:     'w-full h-full flex items-center justify-center',
  posterFbIcon: 'text-white/30',
  badgeState:   'absolute top-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full',
  badgeRating:  'absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full',
  overlay:      'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 gap-1.5',
  overlayTitle: 'text-white text-xs font-semibold leading-tight line-clamp-2',
  progressWrap: 'space-y-1',
  progressMeta: 'flex justify-between text-[10px] text-white/70',
  progressBar:  'h-[3px] rounded-full bg-white/20 overflow-hidden',
  progressFill: 'h-full bg-primary rounded-full transition-all',
  overlayMeta:  'flex items-center gap-1.5 text-[10px] text-white/60',
  overlayType:  'capitalize',
  starIcon:     'text-primary',
  footer:       'px-2 py-2',
  footerTitle:  'text-[11px] font-medium text-text-main line-clamp-1 leading-tight',
  footerBar:    'mt-1.5 h-[3px] rounded-full bg-border overflow-hidden',
  footerFill:   'h-full rounded-full bg-primary transition-all',
};

interface Props {
  entries: UserListEntry[];
  onEdit?: (entry: UserListEntry) => void;
}

export default function ListCardView({ entries, onEdit }: Props) {
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
        <AnimeListCard key={entry.userWatchAnimeId} entry={entry} onEdit={onEdit} />
      ))}
    </div>
  );
}

function AnimeListCard({ entry, onEdit }: { entry: UserListEntry; onEdit?: (e: UserListEntry) => void }) {
  const cfg = STATE_CONFIG[entry.state];
  const progress = entry.numEpisodesTotal > 0
    ? Math.round((entry.numEpisodesWatched / entry.numEpisodesTotal) * 100)
    : null;
  const isMovie = entry.mediaType === 'movie';

  return (
    <div className={styles.card} onClick={() => onEdit?.(entry)}>
      <div className={styles.poster}>
        {entry.imgLarge ? (
          <img src={entry.imgLarge} alt={entry.name} className={styles.posterImg} />
        ) : (
          <div className={styles.posterFb}>
            {isMovie
              ? <Film size={32} className={styles.posterFbIcon} />
              : <Tv   size={32} className={styles.posterFbIcon} />
            }
          </div>
        )}

        <span className={`${styles.badgeState} ${cfg.badge}`}>{cfg.label}</span>

        {entry.userRate !== null && (
          <span className={styles.badgeRating}>
            {entry.userRate}
            <Star size={9} fill="#FF9E00" className={styles.starIcon} />
          </span>
        )}

        <div className={styles.overlay}>
          <p className={styles.overlayTitle}>{entry.name}</p>
          {entry.numEpisodesTotal > 0 && (
            <div className={styles.progressWrap}>
              <div className={styles.progressMeta}>
                <span>{entry.numEpisodesWatched}/{entry.numEpisodesTotal} ep</span>
                {progress !== null && <span>{progress}%</span>}
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress ?? 0}%` }} />
              </div>
            </div>
          )}
          <div className={styles.overlayMeta}>
            {isMovie ? <Film size={10} /> : <Tv size={10} />}
            <span className={styles.overlayType}>{entry.mediaType.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerTitle}>{entry.name}</p>
        {entry.numEpisodesTotal > 0 && (
          <div className={styles.footerBar}>
            <div className={styles.footerFill} style={{ width: `${progress ?? 0}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
