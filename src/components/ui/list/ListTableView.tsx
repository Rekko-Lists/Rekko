import { Star, Film, Tv, Edit2 } from 'lucide-react';
import type { UserListEntry, ListState } from '@/hooks/useUserList';

const AIRING_LABELS: Record<string, string> = {
  finished_airing:  'Finished',
  currently_airing: 'Airing',
  not_yet_aired:    'Upcoming',
};

const STATE_CONFIG: Record<ListState, { label: string; dot: string }> = {
  WATCHING:      { label: 'Watching',       dot: 'bg-status-blue'  },
  COMPLETED:     { label: 'Completed',      dot: 'bg-status-green' },
  ON_HOLD:       { label: 'On Hold',        dot: 'bg-primary'      },
  DROPPED:       { label: 'Dropped',        dot: 'bg-status-red'   },
  PLAN_TO_WATCH: { label: 'Plan to Watch',  dot: 'bg-[#888888]'   },
};

const styles = {
  empty:       'flex flex-col items-center justify-center py-24 text-text-secondary font-gabarito',
  emptyIcon:   'opacity-20 mb-4',
  emptyText:   'text-lg',
  wrapper:     'overflow-x-auto',
  table:       'w-full font-gabarito border-collapse',
  thead:       'text-left',
  thFirst:     'bg-gradient-to-b from-grad-start to-grad-end text-white text-xs font-semibold px-3 py-2 rounded-l-[4px] w-[70px]',
  th:          'bg-gradient-to-b from-grad-start to-grad-end text-white text-xs font-semibold px-3 py-2',
  thRight:     'bg-gradient-to-b from-grad-start to-grad-end text-white text-xs font-semibold px-3 py-2 text-right',
  thLast:      'bg-gradient-to-b from-grad-start to-grad-end text-white text-xs font-semibold px-3 py-2 rounded-r-[4px] w-[40px]',
  rowEven:     'group border-b border-border-light last:border-0 transition-colors hover:bg-primary/5 bg-white',
  rowOdd:      'group border-b border-border-light last:border-0 transition-colors hover:bg-primary/5 bg-app-bg',
  tdCover:     'py-2 px-3',
  cover:       'relative w-[46px] h-[62px] rounded-[3px] overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900 flex-shrink-0',
  coverImg:    'w-full h-full object-cover',
  coverFb:     'w-full h-full flex items-center justify-center',
  coverFbIcon: 'text-white/30',
  tdTitle:     'py-2 px-3',
  titleText:   'text-sm font-semibold text-text-main leading-tight line-clamp-1',
  titleMeta:   'flex items-center gap-2 mt-0.5',
  titleType:   'text-[11px] text-text-secondary capitalize',
  titleState:  'sm:hidden flex items-center gap-1 text-[10px] font-medium',
  titleStateDot:'rounded-full',
  mobileProgress:'md:hidden mt-1.5 space-y-0.5',
  mobileProgMeta:'flex justify-between text-[10px] text-text-secondary',
  mobileProgBar: 'h-[3px] rounded-full bg-border overflow-hidden',
  mobileProgFill:'h-full bg-primary rounded-full',
  tdStatus:    'py-2 px-3 hidden sm:table-cell',
  statusRow:   'flex items-center gap-1.5 text-xs text-text-main whitespace-nowrap',
  statusDot:   'w-2 h-2 rounded-full flex-shrink-0',
  tdProgress:  'py-2 px-3 hidden md:table-cell min-w-[120px]',
  progWrap:    'space-y-1',
  progMeta:    'flex justify-between text-[11px] text-text-secondary',
  progPct:     'font-medium text-text-main',
  progBar:     'h-[4px] rounded-full bg-border overflow-hidden',
  progFill:    'h-full bg-primary rounded-full transition-all',
  progNone:    'text-xs text-text-secondary',
  tdType:      'py-2 px-3 hidden lg:table-cell',
  typeRow:     'flex items-center gap-1 text-xs text-text-secondary capitalize',
  tdAiring:    'py-2 px-3 hidden xl:table-cell',
  airingText:  'text-xs text-text-secondary',
  tdScore:     'py-2 px-3 text-right',
  scoreVal:    'inline-flex items-center gap-1 text-sm font-semibold text-text-main',
  scoreNone:   'text-xs text-border',
  tdEdit:      'py-2 px-3',
  editBtn:     'w-[28px] h-[28px] rounded-[4px] border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-border hover:border-primary',
  editIcon:    'text-text-secondary',
  starIcon:    'text-primary',
};

interface Props {
  entries: UserListEntry[];
  onEdit?: (entry: UserListEntry) => void;
}

export default function ListTableView({ entries, onEdit }: Props) {
  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <Film size={48} className={styles.emptyIcon} />
        <p className={styles.emptyText}>No anime here yet</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.thFirst}>Cover</th>
            <th className={styles.th}>Title</th>
            <th className={`${styles.th} hidden sm:table-cell`}>Status</th>
            <th className={`${styles.th} hidden md:table-cell`}>Progress</th>
            <th className={`${styles.th} hidden lg:table-cell`}>Type</th>
            <th className={`${styles.th} hidden xl:table-cell`}>Airing</th>
            <th className={styles.thRight}>Score</th>
            <th className={styles.thLast} />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <ListRow
              key={entry.userWatchAnimeId}
              entry={entry}
              isEven={i % 2 === 0}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListRow({
  entry,
  isEven,
  onEdit,
}: {
  entry: UserListEntry;
  isEven: boolean;
  onEdit?: (e: UserListEntry) => void;
}) {
  const cfg = STATE_CONFIG[entry.state];
  const isMovie = entry.mediaType === 'movie';
  const progress = entry.numEpisodesTotal > 0
    ? Math.round((entry.numEpisodesWatched / entry.numEpisodesTotal) * 100)
    : null;

  return (
    <tr className={isEven ? styles.rowEven : styles.rowOdd}>
      <td className={styles.tdCover}>
        <div className={styles.cover}>
          {entry.imgMedium ? (
            <img src={entry.imgMedium} alt={entry.name} className={styles.coverImg} />
          ) : (
            <div className={styles.coverFb}>
              {isMovie
                ? <Film size={16} className={styles.coverFbIcon} />
                : <Tv   size={16} className={styles.coverFbIcon} />
              }
            </div>
          )}
        </div>
      </td>

      <td className={styles.tdTitle}>
        <p className={styles.titleText}>{entry.name}</p>
        <div className={styles.titleMeta}>
          <span className={styles.titleType}>{entry.mediaType.replace(/_/g, ' ')}</span>
          <span className={styles.titleState}>
            <span className={`w-1.5 h-1.5 ${styles.titleStateDot} ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
        {entry.numEpisodesTotal > 0 && (
          <div className={styles.mobileProgress}>
            <div className={styles.mobileProgMeta}>
              <span>{entry.numEpisodesWatched}/{entry.numEpisodesTotal}</span>
              {progress !== null && <span>{progress}%</span>}
            </div>
            <div className={styles.mobileProgBar}>
              <div className={styles.mobileProgFill} style={{ width: `${progress ?? 0}%` }} />
            </div>
          </div>
        )}
      </td>

      <td className={styles.tdStatus}>
        <span className={styles.statusRow}>
          <span className={`${styles.statusDot} ${cfg.dot}`} />
          {cfg.label}
        </span>
      </td>

      <td className={styles.tdProgress}>
        {entry.numEpisodesTotal > 0 ? (
          <div className={styles.progWrap}>
            <div className={styles.progMeta}>
              <span>{entry.numEpisodesWatched}/{entry.numEpisodesTotal}</span>
              {progress !== null && <span className={styles.progPct}>{progress}%</span>}
            </div>
            <div className={styles.progBar}>
              <div className={styles.progFill} style={{ width: `${progress ?? 0}%` }} />
            </div>
          </div>
        ) : (
          <span className={styles.progNone}>—</span>
        )}
      </td>

      <td className={styles.tdType}>
        <span className={styles.typeRow}>
          {isMovie ? <Film size={12} /> : <Tv size={12} />}
          {entry.mediaType.replace(/_/g, ' ')}
        </span>
      </td>

      <td className={styles.tdAiring}>
        <span className={styles.airingText}>
          {AIRING_LABELS[entry.animeStatus] ?? '—'}
        </span>
      </td>

      <td className={styles.tdScore}>
        {entry.userRate !== null ? (
          <span className={styles.scoreVal}>
            {entry.userRate}
            <Star size={13} fill="#FF9E00" className={styles.starIcon} />
          </span>
        ) : (
          <span className={styles.scoreNone}>—</span>
        )}
      </td>

      <td className={styles.tdEdit}>
        <button onClick={() => onEdit?.(entry)} className={styles.editBtn}>
          <Edit2 size={12} className={styles.editIcon} />
        </button>
      </td>
    </tr>
  );
}
