import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { getUserWatchList, getUserRateList } from '@/lib/animeService';
import { mergeEntries, type UserListEntry, type ListState } from '@/hooks/useUserList';
import ListTableView from '@/components/ui/list/ListTableView';

const PAGE_LIMIT = 110;

const styles = {
  root:        'bg-surface border border-border rounded-card shadow-card overflow-hidden',
  header:      'flex items-center justify-between px-5 py-3 cursor-pointer select-none border-b border-border hover:bg-app-bg transition-colors',
  titleRow:    'flex items-center gap-2',
  title:       'text-[22px] font-semibold text-text-main leading-none',
  toggleIcon:  'text-text-secondary',
  statsRow:    'flex items-center gap-4 px-5 py-3 border-b border-border-light flex-wrap',
  statItem:    'flex flex-col items-center',
  statCount:   'text-base font-semibold leading-none',
  statLabel:   'text-[10px] text-text-secondary mt-0.5 whitespace-nowrap',
  statDivider: 'w-px h-6 bg-border',
  skeleton:    'px-5 py-8 flex justify-center',
  skLine:      'h-3 bg-slate-100 rounded animate-pulse',
};

const STATE_COLORS: Record<ListState, string> = {
  WATCHING:      'text-status-blue',
  COMPLETED:     'text-status-green',
  ON_HOLD:       'text-primary',
  DROPPED:       'text-status-red',
  PLAN_TO_WATCH: 'text-[#888]',
};

interface Props {
  userId: number;
  username: string;
}

export default function ProfileAnimeList({ userId, username }: Props) {
  const [entries, setEntries] = useState<UserListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      getUserWatchList(userId, { limit: PAGE_LIMIT }, controller.signal),
      getUserRateList(userId,  { limit: PAGE_LIMIT }, controller.signal),
    ])
      .then(([watchRes, rateRes]) => {
        if (controller.signal.aborted) return;
        const rateMap = new Map<number, number>(
          (rateRes.ratingList ?? []).map((r) => [r.animeId, r.rate]),
        );
        setEntries(mergeEntries(watchRes.watchList ?? [], rateMap));
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted || axios.isCancel(err)) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [userId]);

  const counts = useMemo(() => {
    const map: Partial<Record<ListState, number>> = {};
    for (const e of entries) map[e.state] = (map[e.state] ?? 0) + 1;
    return map;
  }, [entries]);

  return (
    <div className={styles.root}>
      {/* Header / toggle */}
      <button className={styles.header} onClick={() => setOpen((v) => !v)}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{username} List</span>
          <span className="text-[22px] font-semibold text-text-secondary leading-none">
            {open ? '−' : '+'}
          </span>
        </div>
        {open
          ? <ChevronUp  size={16} className={styles.toggleIcon} />
          : <ChevronDown size={16} className={styles.toggleIcon} />
        }
      </button>

      {/* Stats bar */}
      {!loading && entries.length > 0 && (
        <div className={styles.statsRow}>
          <StatBadge count={entries.length}          label="Total"         countClass="text-text-main"    />
          <div className={styles.statDivider} />
          <StatBadge count={counts.WATCHING ?? 0}      label="Watching"      countClass={STATE_COLORS.WATCHING}      />
          <StatBadge count={counts.COMPLETED ?? 0}     label="Completed"     countClass={STATE_COLORS.COMPLETED}     />
          <StatBadge count={counts.ON_HOLD ?? 0}       label="On Hold"       countClass={STATE_COLORS.ON_HOLD}       />
          <StatBadge count={counts.DROPPED ?? 0}       label="Dropped"       countClass={STATE_COLORS.DROPPED}       />
          <StatBadge count={counts.PLAN_TO_WATCH ?? 0} label="Plan to Watch" countClass={STATE_COLORS.PLAN_TO_WATCH} />
        </div>
      )}

      {/* Content */}
      {open && (
        loading ? (
          <div className={styles.skeleton}>
            <div className="w-full space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${styles.skLine} w-full`} style={{ opacity: 1 - i * 0.2 }} />
              ))}
            </div>
          </div>
        ) : (
          <ListTableView entries={entries} showEdit={false} />
        )
      )}
    </div>
  );
}

function StatBadge({ count, label, countClass }: { count: number; label: string; countClass: string }) {
  return (
    <div className={styles.statItem}>
      <span className={`${styles.statCount} ${countClass}`}>{count}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
