import { Eye, Heart, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { KeyboardEvent, MouseEvent } from 'react';
import rekkoSword from '@/assets/rekko_sword.png';
import { Anime } from '@/types/anime.ts';

interface Props {
  anime: Anime;
  inListCount?: number;
  completedCount?: number;
  onAddToList?: () => void;
}

const styles = {
  card:       'flex flex-col font-gabarito cursor-pointer w-[180px] group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card',
  poster:     'relative w-full aspect-[175/245] rounded-card overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900',
  overlay:    'absolute bottom-0 inset-x-0 bg-black/65 flex items-center justify-between px-3 py-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200',
  addBtn:     'text-white text-[11px] font-medium hover:text-primary transition-colors',
  score:      'flex items-center gap-0.5 text-white text-[13px] font-semibold',
  iconRow:    'flex items-center gap-3 mt-2 px-0.5',
  iconBtn:    'flex items-center gap-1 text-text-secondary text-xs',
  title:      'mt-1.5 text-[13px] font-medium text-text-main',
};

export default function AnimeCard({ anime, inListCount, completedCount, onAddToList }: Props) {
  const navigate = useNavigate();
  const score = anime.malMean > 0 ? anime.malMean : null;

  const goToDetail = () => navigate(`/animes/${anime.malId}`);

  function handleAddToList(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onAddToList?.();
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
        <div className={styles.overlay}>
          <button className={styles.addBtn} onClick={handleAddToList}>Add to List</button>
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
        {inListCount !== undefined && (
          <span className={styles.iconBtn}>
            <Eye size={14} />
            <span>{inListCount}</span>
          </span>
        )}
        {completedCount !== undefined && (
          <span className={styles.iconBtn}>
            <Users size={14} />
            <span>{completedCount}</span>
          </span>
        )}
        <span className={styles.iconBtn}>
          <Heart size={14} />
          {anime.likes > 0 && <span>{anime.likes}</span>}
        </span>
      </div>
      <p className={styles.title}>{anime.name}</p>
    </div>
  );
}
