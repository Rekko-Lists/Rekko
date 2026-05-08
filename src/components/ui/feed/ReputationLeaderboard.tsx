import { Heart } from 'lucide-react';
import Avatar from '@/components/ui/common/Avatar';

const RANK_COLORS: Record<number, string> = {
  1: '#FF9E00',
  2: '#788397',
  3: '#CC5F00',
};

const styles = {
  card:     'bg-surface border-[1.5px] border-border rounded-card p-4',
  title:    'text-sm font-normal text-text-main mb-3',
  row:      'flex items-center gap-2 py-2 border-b border-border last:border-0',
  hearts:   'ml-auto flex items-center gap-1 text-xs text-text-secondary',
};

interface LeaderboardEntry {
  rank: number;
  user: string;
  hearts: number;
  avatar?: string;
}

interface Props {
  entries: LeaderboardEntry[];
}

export default function ReputationLeaderboard({ entries }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Reputation Leaderboard</p>
      {entries.map(e => (
        <div key={e.rank} className={styles.row}>
          <span
            className="text-sm font-semibold w-4"
            style={{ color: RANK_COLORS[e.rank] ?? '#000' }}
          >
            {e.rank}
          </span>
          <Avatar username={e.user} src={e.avatar} size="sm" />
          <span className="text-xs text-text-main ml-1">{e.user}</span>
          <span className={styles.hearts}>
            <Heart size={12} fill="#FF9E00" className="text-primary" />
            {e.hearts}
          </span>
        </div>
      ))}
    </div>
  );
}
