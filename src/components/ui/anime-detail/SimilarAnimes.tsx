import { useNavigate } from 'react-router-dom';
import type { Anime } from '@/types/anime';

interface Props {
  animes: Anime[];
  loading?: boolean;
  malId: number;
}

const styles = {
  section:    'flex flex-col items-start font-gabarito',
  label:      'text-[20px] text-text-main mb-3 leading-none',
  row:        'flex items-end gap-3',
  card1:      'w-[118px] h-[167px] rounded-[10px] overflow-hidden cursor-pointer shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-gradient-to-br from-slate-500 to-slate-800 hover:opacity-90 transition-opacity',
  card2:      'w-[119px] h-[167px] rounded-[10px] overflow-hidden cursor-pointer shadow-[0px_4px_20px_0px_rgba(0,0,0,0.6)] bg-gradient-to-br from-slate-500 to-slate-800 hover:opacity-90 transition-opacity -translate-y-2',
  card3:      'w-[119px] h-[169px] rounded-[10px] overflow-hidden cursor-pointer shadow-[0px_4px_20px_0px_rgba(0,0,0,0.5)] bg-gradient-to-br from-slate-500 to-slate-800 hover:opacity-90 transition-opacity',
  img:        'w-full h-full object-cover',
  viewMore:   'mt-3 px-4 h-[34px] bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.25)] rounded-card text-[#202020] text-[14px] font-gabarito hover:bg-app-bg transition-colors',
  empty:      'text-text-muted text-sm py-8',
};

export default function SimilarAnimes({ animes, loading, malId }: Props) {
  const navigate = useNavigate();

  const handleClick = (id: number) => navigate(`/animes/${id}`);
  const handleViewMore = () => navigate(`/animes?recommendedFor=${malId}`);

  if (loading) {
    return (
      <section className={styles.section} aria-label="Similar Animes">
        <h2 className={styles.label}>Similar Animes:</h2>
        <div className={styles.empty}>Loading…</div>
      </section>
    );
  }

  if (animes.length === 0) return null;

  const cardClasses = [styles.card1, styles.card2, styles.card3];

  return (
    <section className={styles.section} aria-label="Similar Animes">
      <h2 className={styles.label}>Similar Animes:</h2>
      <div className={styles.row}>
        {animes.slice(0, 3).map((a, i) => (
          <button
            key={a.malId}
            type="button"
            className={cardClasses[i] ?? cardClasses[0]}
            onClick={() => handleClick(a.malId)}
            title={a.name}
            aria-label={a.name}
          >
            {a.imgMedium && <img src={a.imgMedium} alt={a.name} className={styles.img} />}
          </button>
        ))}
      </div>
      <button type="button" className={styles.viewMore} onClick={handleViewMore}>
        View more
      </button>
    </section>
  );
}
