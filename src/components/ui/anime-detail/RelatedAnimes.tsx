import { useNavigate } from 'react-router-dom';
import type { AnimeRelation } from '@/types/anime';

interface Props {
  relations: AnimeRelation[];
  loading?: boolean;
  malId: number;
}

const styles = {
  section:    'flex flex-col font-gabarito',
  header:     'flex items-baseline justify-between mb-3',
  label:      'text-[20px] text-text-main leading-none',
  viewAll:    'text-[13px] font-medium text-primary hover:text-primary-dark hover:underline',
  list:       'flex gap-3 overflow-x-auto pb-2',
  card:       'relative flex-shrink-0 w-[110px] cursor-pointer group',
  img:        'w-[110px] h-[155px] rounded-[10px] object-cover bg-gradient-to-br from-slate-500 to-slate-800 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.2)] group-hover:opacity-90 transition-opacity',
  imgPlaceholder: 'w-[110px] h-[155px] rounded-[10px] bg-border-light',
  title:      'mt-1.5 text-[12px] text-text-main leading-tight line-clamp-2',
  type:       'text-[11px] text-primary leading-none mt-0.5',
  empty:      'text-text-muted text-sm py-4',
  placeholderRow: 'flex gap-3',
  emptyText:  'mt-2 text-text-muted text-[13px]',
};

function formatRelationLabel(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function RelatedAnimes({ relations, loading, malId }: Props) {
  const navigate = useNavigate();

  const handleClick = (id: number) => navigate(`/animes/${id}`);

  if (loading) {
    return (
      <section className={styles.section} aria-label="Related to">
        <h2 className={styles.label}>Related to:</h2>
        <div className={styles.placeholderRow}>
          <div className={styles.imgPlaceholder} />
          <div className={styles.imgPlaceholder} />
          <div className={styles.imgPlaceholder} />
        </div>
        <p className={styles.emptyText}>Loading…</p>
      </section>
    );
  }

  if (relations.length === 0) {
    return (
      <section className={styles.section} aria-label="Related to">
        <h2 className={styles.label}>Related to:</h2>
        <div className={styles.placeholderRow}>
          <div className={styles.imgPlaceholder} />
          <div className={styles.imgPlaceholder} />
          <div className={styles.imgPlaceholder} />
        </div>
        <p className={styles.emptyText}>No related animes found.</p>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Related to">
      <div className={styles.header}>
        <h2 className={styles.label}>Related to:</h2>
        {relations.length > 8 && (
          <button
            type="button"
            className={styles.viewAll}
            onClick={() => navigate(`/animes?relatedTo=${malId}`)}
          >
            View all
          </button>
        )}
      </div>
      <div className={styles.list}>
        {relations.slice(0, 8).map((r) => (
          <button
            key={`${r.relatedMalId}-${r.relationType}`}
            type="button"
            className={styles.card}
            onClick={() => handleClick(r.relatedMalId)}
            title={r.relatedTitle}
            aria-label={r.relatedTitle}
          >
            {r.relatedImage ? (
              <img src={r.relatedImage} alt={r.relatedTitle} className={styles.img} />
            ) : (
              <div className={styles.imgPlaceholder} />
            )}
            <p className={styles.type}>
              {r.relationLabel || formatRelationLabel(r.relationType)}
            </p>
            <p className={styles.title}>{r.relatedTitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
