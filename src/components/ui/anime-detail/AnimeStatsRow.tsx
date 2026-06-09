import { Eye, Heart, Star, Users } from 'lucide-react';
import { formatCompactNumber } from '@/utils/formatNumber';

interface Props {
  mean: number;
  likes: number;
  liked?: boolean;
  inListCount?: number;
  members?: number;
  onToggleLike?: () => void;
  canLike?: boolean;
}

const styles = {
  wrap:    'w-[209px] mx-auto flex items-center justify-between gap-2 font-gabarito text-[13px]',
  stat:    'flex items-center gap-1 text-text-main',
  meanVal: 'text-primary font-semibold',
  likeBtn: 'flex items-center gap-1 hover:opacity-70 transition-opacity disabled:cursor-not-allowed',
};

export default function AnimeStatsRow({
  mean,
  likes,
  liked,
  inListCount,
  members,
  onToggleLike,
  canLike = true,
}: Props) {
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
        <span>{formatCompactNumber(likes)}</span>
      </button>
      <span className={styles.stat} title="In list">
        <Eye size={14} />
        <span>{formatCompactNumber(inListCount ?? 0)}</span>
      </span>
      <span className={styles.stat} title="Members">
        <Users size={14} />
        <span>{formatCompactNumber(members ?? 0)}</span>
      </span>
    </div>
  );
}
