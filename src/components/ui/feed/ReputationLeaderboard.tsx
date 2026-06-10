import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/common/Avatar';

const RANK_COLORS: Record<number, string> = {
  1: '#FF9E00',
  2: '#788397',
  3: '#CC5F00',
};

const styles = {
  card:     'bg-surface border-[1.5px] border-border rounded-card p-4',
  cardFlat: 'px-1 py-2 font-gabarito',
  header:   'mb-3 flex items-center justify-between gap-2',
  title:    'text-sm font-normal text-text-main',
  titleFlat:'text-sm font-semibold text-text-main border-b-2 border-primary pb-0.5',
  viewMore: 'text-[11px] font-medium text-primary hover:text-primary-dark hover:underline underline-offset-2',
  row:      'flex items-center gap-2 py-2 border-b border-border last:border-0',
  hearts:   'ml-auto flex items-center gap-1 text-xs text-text-secondary',
  link:     'flex items-center gap-2 min-w-0 flex-1',
};

interface LeaderboardEntry {
  rank: number;
  user: string;
  hearts: number;
  avatar?: string;
}

interface Props {
  entries: LeaderboardEntry[];
  onViewMore?: () => void;
  /** Mobile in-feed mode: render without card background/border. */
  flat?: boolean;
}

export default function ReputationLeaderboard({ entries, onViewMore, flat = false }: Props) {
  return (
    <div className={flat ? styles.cardFlat : styles.card}>
      <div className={styles.header}>
        <p className={flat ? styles.titleFlat : styles.title}>Reputation Leaderboard</p>
        {onViewMore && (
          <button type="button" className={styles.viewMore} onClick={onViewMore}>
            View more
          </button>
        )}
      </div>
      {entries.map(e => (
        <div key={e.rank} className={styles.row}>
          <span
            className="text-sm font-semibold w-4"
            style={{ color: RANK_COLORS[e.rank] ?? '#000' }}
          >
            {e.rank}
          </span>
          <Link to={`/profile/${e.user}`} className={styles.link}>
            <Avatar username={e.user} src={e.avatar} size="sm" />
            <span className="text-xs text-text-main truncate">{e.user}</span>
          </Link>
          <span className={styles.hearts}>
            <Heart size={12} fill="#FF9E00" className="text-primary" />
            {e.hearts}
          </span>
        </div>
      ))}
    </div>
  );
}
