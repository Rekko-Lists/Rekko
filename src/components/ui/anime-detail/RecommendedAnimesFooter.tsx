import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RecommendedAnimeItem } from '@/types/anime';

interface Props {
  animes: RecommendedAnimeItem[];
  loading?: boolean;
  malId: number;
}

const styles = {
  section:  'flex flex-col font-gabarito',
  header:   'flex items-baseline justify-between mb-3',
  label:    'text-[20px] text-text-main leading-none',
  viewAll:  'text-[13px] font-medium text-primary hover:text-primary-dark hover:underline',
  list:     'flex gap-4 overflow-x-auto pb-2',
  card:     'flex-shrink-0 w-[170px] cursor-pointer group',
  poster:   'w-[170px] h-[240px] rounded-card overflow-hidden bg-gradient-to-br from-slate-500 to-slate-800 group-hover:opacity-90 transition-opacity',
  img:      'w-full h-full object-cover',
  name:     'mt-1.5 text-[13px] font-medium text-text-main line-clamp-1',
  meta:     'flex items-center gap-2 mt-0.5 text-[11px] text-text-muted',
  score:    'flex items-center gap-0.5 text-primary',
  genres:   'truncate',
  placeholder: 'w-[170px] h-[240px] rounded-card bg-border-light',
  empty:    'mt-2 text-text-muted text-[13px]',
};

export default function RecommendedAnimesFooter({ animes, loading, malId }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className={styles.section} aria-label="Recommended for you">
        <div className={styles.header}>
          <h2 className={styles.label}>Recommended for you:</h2>
        </div>
        <div className={styles.list}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.placeholder} />
          ))}
        </div>
      </section>
    );
  }

  if (animes.length === 0) {
    return (
      <section className={styles.section} aria-label="Recommended for you">
        <div className={styles.header}>
          <h2 className={styles.label}>Recommended for you:</h2>
        </div>
        <div className={styles.list}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.placeholder} />
          ))}
        </div>
        <p className={styles.empty}>No recommendations yet.</p>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Recommended for you">
      <div className={styles.header}>
        <h2 className={styles.label}>Recommended for you:</h2>
        <button
          type="button"
          className={styles.viewAll}
          onClick={() => navigate(`/animes?recommendedFor=${malId}`)}
        >
          View all
        </button>
      </div>
      <div className={styles.list}>
        {animes.map((a) => (
          <button
            key={a.malId}
            type="button"
            className={styles.card}
            onClick={() => navigate(`/animes/${a.malId}`)}
            title={a.name}
            aria-label={a.name}
          >
            <div className={styles.poster}>
              {a.imgLarge || a.imgMedium ? (
                <img src={a.imgLarge || a.imgMedium} alt={a.name} className={styles.img} />
              ) : null}
            </div>
            <p className={styles.name}>{a.name}</p>
            <div className={styles.meta}>
              {a.malMean > 0 && (
                <span className={styles.score}>
                  <Star size={11} fill="currentColor" />
                  {a.malMean.toFixed(2)}
                </span>
              )}
              {a.genres && a.genres.length > 0 && (
                <span className={styles.genres}>{a.genres.slice(0, 2).join(' · ')}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
