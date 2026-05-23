import { Check, Heart, Star, User } from 'lucide-react';

interface Props {
  mean: number;
  likes: number;
  liked?: boolean;
  inListCount?: number;
  completedCount?: number;
  onToggleLike?: () => void;
  canLike?: boolean;
}

const styles = {
  wrap:    'flex items-center gap-4 font-gabarito text-[13px]',
  stat:    'flex items-center gap-1 text-text-main',
  meanVal: 'text-primary font-semibold',
  greenBox:'w-[14px] h-[14px] bg-[#4ebb22] rounded-[3px] flex items-center justify-center',
  likeBtn: 'flex items-center gap-1 hover:opacity-70 transition-opacity disabled:cursor-not-allowed',
};

export default function AnimeStatsRow({
  mean,
  likes,
  liked,
  inListCount,
  completedCount,
  onToggleLike,
  canLike = true,
}: Props) {
  const formatNumber = (n: number) => (Number.isFinite(n) && n > 0 ? n.toLocaleString() : '0');
  const meanLabel = mean > 0 ? mean.toFixed(2) : '—';

  return (
    <div className={styles.wrap}>
      <span className={styles.stat} title="Rekko score">
        <Star size={14} fill="#FF9E00" className="text-primary" />
        <span className={styles.meanVal}>{meanLabel}</span>
      </span>
      <button
        type="button"
        className={styles.likeBtn}
        onClick={onToggleLike}
        disabled={!canLike}
        title={canLike ? (liked ? 'Unlike' : 'Like') : 'Sign in to like'}
      >
        <Heart size={14} fill={liked ? '#FF9E00' : 'none'} className={liked ? 'text-primary' : 'text-text-main'} />
        <span>{formatNumber(likes)}</span>
      </button>
      <span className={styles.stat} title="In list">
        <User size={14} />
        <span>{formatNumber(inListCount ?? 0)}</span>
      </span>
      <span className={styles.stat} title="Completed (coming soon)">
        <span className={styles.greenBox}>
          <Check size={10} strokeWidth={3} className="text-white" />
        </span>
        <span>{completedCount !== undefined ? formatNumber(completedCount) : '—'}</span>
      </span>
    </div>
  );
}
