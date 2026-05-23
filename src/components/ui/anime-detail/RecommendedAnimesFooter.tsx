import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RecommendedAnimeItem } from '@/types/anime';

interface Props {
  animes: RecommendedAnimeItem[];
  loading?: boolean;
  malId: number;
}

const styles = {
  card:        'w-full bg-surface border-2 border-border rounded-bl-card rounded-br-card rounded-tl-btn rounded-tr-btn p-4 font-gabarito',
  label:       'text-[20px] text-text-main mb-3 leading-none',
  row:         'flex items-start gap-3',
  list:        'flex-1 flex gap-3 overflow-x-auto pb-2',
  miniCard:    'relative flex-shrink-0 w-[76px] h-[106px] rounded-card overflow-hidden cursor-pointer bg-gradient-to-br from-slate-500 to-slate-800 hover:opacity-90 transition-opacity',
  miniImg:     'w-full h-full object-cover',
  countOverlay:'absolute bottom-0 left-0 right-0 h-[21px] bg-[rgba(0,0,0,0.46)] rounded-bl-card rounded-br-card flex items-center justify-center text-white text-[12px] font-semibold',
  viewBtn:     'flex flex-col items-center justify-center w-[51px] h-[68px] bg-border-light rounded-btn text-[#788397] hover:bg-border transition-colors flex-shrink-0',
  viewTxt:     'text-[13px] leading-none mt-0.5',
  empty:       'text-text-muted text-sm py-4',
};

export default function RecommendedAnimesFooter({ animes, loading, malId }: Props) {
  const navigate = useNavigate();

  const handleViewMore = () => navigate(`/animes?recommendedFor=${malId}`);
  const handleClick = (id: number) => navigate(`/animes/${id}`);

  if (loading) {
    return (
      <section className={styles.card} aria-label="Popular related">
        <h2 className={styles.label}>Popular related:</h2>
        <div className={styles.empty}>Loading…</div>
      </section>
    );
  }

  if (animes.length === 0) return null;

  return (
    <section className={styles.card} aria-label="Popular related">
      <h2 className={styles.label}>Popular related:</h2>
      <div className={styles.row}>
        <div className={styles.list}>
          {animes.map((a) => (
            <button
              key={a.malId}
              type="button"
              className={styles.miniCard}
              onClick={() => handleClick(a.malId)}
              title={a.name}
              aria-label={a.name}
            >
              {a.imgMedium && <img src={a.imgMedium} alt={a.name} className={styles.miniImg} />}
              {a.coAppearanceCount !== undefined && a.coAppearanceCount > 0 && (
                <div className={styles.countOverlay}>{a.coAppearanceCount}</div>
              )}
            </button>
          ))}
        </div>
        <button type="button" className={styles.viewBtn} onClick={handleViewMore} title="View more">
          <Plus size={20} strokeWidth={1.5} />
          <span className={styles.viewTxt}>View</span>
        </button>
      </div>
    </section>
  );
}
