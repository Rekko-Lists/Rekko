const styles = {
  card:       'bg-surface border-[1.5px] border-border rounded-card p-4 font-gabarito',
  title:      'text-sm font-normal text-text-main mb-3',
  // Vertical (default) — comportamiento original
  list:       '',
  item:       'flex gap-2 mb-3 last:mb-0',
  cover:      'w-[44px] h-[69px] flex-shrink-0 bg-gradient-to-br from-slate-400 to-slate-700 rounded-[3px] object-cover',
  text:       'text-xs text-text-main leading-snug',
  date:       'text-[10px] text-text-muted mt-1',
  // Horizontal — usado en la vista de detalle de anime
  rowList:    'grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  rowItem:    'flex gap-2 items-start',
  rowCover:   'w-[44px] h-[68px] flex-shrink-0 bg-gradient-to-br from-slate-400 to-slate-700 rounded-[3px] object-cover',
  rowBody:    'flex flex-col min-w-0 flex-1',
  rowText:    'text-xs text-text-main leading-snug line-clamp-3',
  rowDate:    'text-[10px] text-text-muted mt-1',
};

interface NewsItem {
  id: string;
  title: string;
  date: string;
  cover?: string;
  url?: string;
}

interface Props {
  items: NewsItem[];
  orientation?: 'vertical' | 'horizontal';
}

export default function AnimeNewsCard({ items, orientation = 'vertical' }: Props) {
  if (orientation === 'horizontal') {
    return (
      <div className={styles.card}>
        <p className={styles.title}>Anime News</p>
        <div className={styles.rowList}>
          {items.map(n => (
            <a
              key={n.id}
              className={styles.rowItem}
              href={n.url}
              target={n.url ? '_blank' : undefined}
              rel={n.url ? 'noreferrer' : undefined}
            >
              {n.cover
                ? <img src={n.cover} alt="" className={styles.rowCover} />
                : <div className={styles.rowCover} />
              }
              <div className={styles.rowBody}>
                <p className={styles.rowText}>{n.title}</p>
                <p className={styles.rowDate}>{n.date}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Vertical (default) — sin cambios respecto al comportamiento original
  return (
    <div className={styles.card}>
      <p className={styles.title}>Anime News</p>
      {items.map(n => (
          <a
            key={n.id}
            className={styles.item}
            href={n.url}
            target={n.url ? '_blank' : undefined}
            rel={n.url ? 'noreferrer' : undefined}
          >
          {n.cover
            ? <img src={n.cover} alt="" className={styles.cover} />
            : <div className={styles.cover} />
          }
          <div>
            <p className={styles.text}>{n.title}</p>
            <p className={styles.date}>{n.date}</p>
          </div>
          </a>
        ))}
    </div>
  );
}
