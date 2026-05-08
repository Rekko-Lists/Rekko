import { Eye, Heart, Star, Users } from 'lucide-react';
import rekkoSword from '@/assets/rekko_sword.png';

interface Props {
  id: string;
  title: string;
  cover?: string;
  score?: number;
  views?: string;
  members?: string;
  favorites?: string;
  onAddToList?: () => void;
}

const styles = {
  card:       'flex flex-col font-gabarito cursor-pointer group',
  poster:     'relative w-full aspect-[175/245] rounded-card overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900',
  overlay:    'absolute bottom-0 inset-x-0 bg-black/65 flex items-center justify-between px-3 py-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200',
  addBtn:     'text-white text-[11px] font-medium hover:text-primary transition-colors',
  score:      'flex items-center gap-0.5 text-white text-[13px] font-semibold',
  iconRow:    'flex items-center gap-3 mt-2 px-0.5',
  iconBtn:    'flex items-center gap-1 text-text-secondary text-xs',
  title:      'mt-1.5 text-[13px] font-medium text-text-main leading-tight text-center',
};

export default function AnimeCard({ title, cover, score, views, members, favorites, onAddToList }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.poster}>
        {cover && <img src={cover} alt={title} className="w-full h-full object-cover" />}
        <div className={styles.overlay}>
          <button className={styles.addBtn} onClick={onAddToList}>Add to List</button>
          {score !== undefined && (
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
        <span className={styles.iconBtn}>
          <Eye size={14} />
          {views && <span>{views}</span>}
        </span>
        <span className={styles.iconBtn}>
          <Users size={14} />
          {members && <span>{members}</span>}
        </span>
        <span className={styles.iconBtn}>
          <Heart size={14} />
          {favorites && <span>{favorites}</span>}
        </span>
      </div>
      <p className={styles.title}>{title}</p>
    </div>
  );
}
