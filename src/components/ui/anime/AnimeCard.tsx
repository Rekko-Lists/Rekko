import { Heart, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';
import rekkoSword from '@/assets/rekko_sword.png';
import { Anime, WatchState } from '@/types/anime.ts';
import { setWatchState } from '@/lib/animeService';
import { formatCompactNumber } from '@/utils/formatNumber';

interface Props {
  anime: Anime;
  inListCount?: number;
  completedCount?: number;
  onAddToList?: () => void;
  onListUpdated?: (malId: number, newState: WatchState) => void;
}

const styles = {
  card:       'flex flex-col font-gabarito cursor-pointer w-[180px] group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card',
  poster:     'relative w-full aspect-[175/245] rounded-card overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900',
  overlay:    'absolute bottom-0 inset-x-0 bg-black/65 flex items-center justify-between px-3 py-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200',
  addBtn:     'text-white text-[11px] font-medium hover:text-primary transition-colors',
  score:      'flex items-center gap-0.5 text-white text-[13px] font-semibold',
  iconRow:    'flex items-center gap-3 mt-2 px-0.5',
  iconBtn:    'flex items-center gap-1 text-text-secondary text-xs',
  iconBtnActive: 'flex items-center gap-1 text-primary text-xs',
  title:      'mt-1.5 text-[13px] font-medium text-text-main',
  inListBadge:'absolute top-2 right-2 bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full',
  postsBtn:   'mt-2 mx-auto w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors',
};

export default function AnimeCard({ anime, completedCount, onAddToList, onListUpdated }: Props) {
  const navigate = useNavigate();
  const score = anime.malMean > 0 ? anime.malMean : null;
  const members = (anime as unknown as { members?: number }).members ?? 0;

  const [localWatchState, setLocalWatchState] = useState<WatchState | null>(anime.userWatchState ?? null);

  useEffect(() => {
    setLocalWatchState(anime.userWatchState ?? null);
  }, [anime.userWatchState]);

  const goToDetail = () => navigate(`/animes/${anime.malId}`);

  async function handleAddToList(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (localWatchState) return; // edit list = no-op por ahora
    const prev = localWatchState;
    setLocalWatchState('PLAN_TO_WATCH');
    try {
      await setWatchState(anime.malId, 'PLAN_TO_WATCH', 0);
      onAddToList?.();
      onListUpdated?.(anime.malId, 'PLAN_TO_WATCH');
    } catch {
      setLocalWatchState(prev);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToDetail();
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={anime.name}
      onClick={goToDetail}
      onKeyDown={handleKeyDown}
      className={styles.card}
    >
      <div className={styles.poster}>
        {anime.imgMedium && <img src={anime.imgMedium} alt={anime.name} className="w-full h-full object-cover" />}
        {localWatchState && (
          <span className={styles.inListBadge} title={`In your list (${localWatchState.toLowerCase().replace(/_/g, ' ')})`}>
            In list
          </span>
        )}
        <div className={styles.overlay}>
          <button className={styles.addBtn} onClick={handleAddToList}>
            {localWatchState ? 'Edit list' : 'Add to List'}
          </button>
          {score !== null && (
            <span className={styles.score}>
              {score.toFixed(2)}
              <Star size={12} fill="#FF9E00" className="text-primary" />
            </span>
          )}
        </div>
      </div>
      <div className={styles.iconRow}>
        <span className={styles.iconBtn}>
          <img src={rekkoSword} alt="" className="w-4 h-4 object-contain rotate-[-35deg]" />
        </span>
        <span className={localWatchState ? styles.iconBtnActive : styles.iconBtn}>
          <Users size={14} />
          <span>{formatCompactNumber(members)}</span>
        </span>
        {completedCount !== undefined && (
          <span className={styles.iconBtn}>
            <Users size={14} />
            <span>{formatCompactNumber(completedCount)}</span>
          </span>
        )}
        <span className={anime.liked ? styles.iconBtnActive : styles.iconBtn}>
          <Heart size={14} fill={anime.liked ? 'currentColor' : 'none'} />
          {anime.likes > 0 && <span>{formatCompactNumber(anime.likes)}</span>}
        </span>
      </div>
      <p className={styles.title}>{anime.name}</p>
      <button
        type="button"
        className={styles.postsBtn}
        title="Open posts"
        onClick={(e) => { e.stopPropagation(); /* TODO: abrir modal de posts */ }}
        aria-label="Open posts modal"
      >
        <img src={rekkoSword} className="w-4 h-4" style={{ filter: 'brightness(0) invert(1)' }} alt="" />
      </button>
    </div>
  );
}
