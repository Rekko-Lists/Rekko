import { useNavigate } from 'react-router-dom';
import type { Anime } from '@/types/anime';

interface Props {
  animes: Anime[];
  loading?: boolean;
  malId: number;
}

// Overlapping fan-out: the center card sits forward and lifted, the two side
// cards are slightly smaller, tucked behind, and tilted away. Big drop shadow
// on the middle one to make it pop. Container is a single relative box so the
// negative margins on the side cards never push siblings around.
const styles = {
  section:     'flex flex-col items-start font-gabarito',
  label:       'text-[20px] text-text-main mb-3 leading-none',
  stack:       'relative h-[180px] w-[280px]',
  cardBase:    'absolute top-0 rounded-[10px] overflow-hidden cursor-pointer bg-gradient-to-br from-slate-500 to-slate-800 transition-transform duration-200',
  cardLeft:    'left-0 w-[100px] h-[150px] -rotate-[6deg] translate-y-3 shadow-[0px_6px_18px_0px_rgba(0,0,0,0.30)] z-0 hover:-translate-y-1 hover:-rotate-[8deg]',
  cardCenter:  'left-1/2 -translate-x-1/2 w-[120px] h-[170px] shadow-[0px_10px_28px_0px_rgba(0,0,0,0.45)] z-20 hover:-translate-y-1 hover:-translate-x-1/2',
  cardRight:   'right-0 w-[100px] h-[150px] rotate-[6deg] translate-y-3 shadow-[0px_6px_18px_0px_rgba(0,0,0,0.30)] z-0 hover:-translate-y-1 hover:rotate-[8deg]',
  img:         'w-full h-full object-cover',
  viewMore:    'mt-4 px-4 h-[34px] bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.25)] rounded-card text-[#202020] text-[14px] font-gabarito hover:bg-app-bg transition-colors',
  placeholder: 'bg-border-light',
  emptyText:   'mt-3 text-text-muted text-[13px]',
};

export default function SimilarAnimes({ animes, loading, malId }: Props) {
  const navigate = useNavigate();

  const handleClick = (id: number) => navigate(`/animes/${id}`);
  const handleViewMore = () => navigate(`/animes?recommendedFor=${malId}`);

  // Always render a 3-slot fan-out: left, center (front), right.
  // When animes are missing, slots become placeholders so the layout stays.
  const slotClasses = [styles.cardLeft, styles.cardCenter, styles.cardRight];
  // Order so the middle slot gets the most relevant anime (first one)
  const slotOrder = [1, 0, 2];

  const slots = slotOrder.map((animeIndex, slotIndex) => {
    const anime = animes[animeIndex];
    const slotClass = `${styles.cardBase} ${slotClasses[slotIndex]}`;
    if (!anime) {
      return (
        <div
          key={`slot-${slotIndex}`}
          className={`${slotClass} ${styles.placeholder}`}
          aria-hidden
        />
      );
    }
    return (
      <button
        key={anime.malId}
        type="button"
        className={slotClass}
        onClick={() => handleClick(anime.malId)}
        title={anime.name}
        aria-label={anime.name}
      >
        {anime.imgMedium && (
          <img src={anime.imgMedium} alt={anime.name} className={styles.img} />
        )}
      </button>
    );
  });

  return (
    <section className={styles.section} aria-label="Similar Animes">
      <h2 className={styles.label}>Similar Animes:</h2>
      <div className={styles.stack}>{slots}</div>
      {loading ? (
        <p className={styles.emptyText}>Loading…</p>
      ) : animes.length === 0 ? (
        <p className={styles.emptyText}>No similar animes found.</p>
      ) : (
        <button type="button" className={styles.viewMore} onClick={handleViewMore}>
          View more
        </button>
      )}
    </section>
  );
}
