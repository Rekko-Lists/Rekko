interface Cover {
  id: string | number;
  title: string;
  cover?: string;
}

interface Props {
  animes: Cover[];
  showAddBtn?: boolean;
  variant?: 'default' | 'mini';
  className?: string;
  onAddAnime?: (anime: Cover) => void;
  onAnimeClick?: (anime: Cover) => void;
}

const styles = {
  wrap:        'flex gap-2',
  item:        'group flex flex-col gap-1 flex-shrink-0',
  posterWrap:  'relative flex-shrink-0',
  poster:      'block rounded-card overflow-hidden bg-gradient-to-br from-slate-500 to-slate-800 cursor-pointer',
  posterDefault: 'w-[58px] h-[82px]',
  posterMini:  'w-[40px] h-[56px]',
  img:         'w-full h-full object-cover',
  placeholder: 'w-full h-full bg-gradient-to-br from-slate-500 to-slate-800',
  addBtn:      'absolute right-1 bottom-1 translate-y-1 opacity-0 rounded-[3px] bg-primary px-1.5 py-0.5 text-[8px] font-semibold text-white shadow-sm transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:bg-primary-dark',
  title:       'text-[10px] leading-tight text-text-main line-clamp-2',
  titleDefault: 'w-[58px]',
  titleMini:   'w-[40px] text-[9px]',
};

export default function AnimeCovers({ animes, showAddBtn = true, variant = 'default', className = '', onAddAnime, onAnimeClick }: Props) {
  const posterSize = variant === 'mini' ? styles.posterMini : styles.posterDefault;
  const titleSize = variant === 'mini' ? styles.titleMini : styles.titleDefault;

  return (
    <div className={`${styles.wrap} ${className}`}>
      {animes.map(a => (
        <div key={a.id} className={styles.item}>
          <div className={styles.posterWrap}>
            <button
              type="button"
              className={`${styles.poster} ${posterSize}`}
              onClick={() => onAnimeClick?.(a)}
              aria-label={onAnimeClick ? `Open ${a.title}` : undefined}
              disabled={!onAnimeClick}
            >
              {a.cover
                ? <img src={a.cover} alt={a.title} className={styles.img} />
                : <div className={styles.placeholder} aria-hidden />
              }
            </button>
            {showAddBtn && (
              <button
                type="button"
                className={styles.addBtn}
                onClick={(event) => {
                  event.stopPropagation();
                  onAddAnime?.(a);
                }}
              >
                + Add
              </button>
            )}
          </div>
          <span className={`${styles.title} ${titleSize}`}>{a.title}</span>
        </div>
      ))}
    </div>
  );
}
