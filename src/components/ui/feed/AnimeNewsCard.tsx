const styles = {
  card:      'bg-surface border-[1.5px] border-border rounded-card p-4',
  title:     'text-sm font-normal text-text-main mb-3',
  item:      'flex gap-2 mb-3 last:mb-0',
  cover:     'w-[44px] h-[69px] flex-shrink-0 bg-gradient-to-br from-slate-400 to-slate-700 rounded-[3px]',
  text:      'text-xs text-text-main leading-snug',
  date:      'text-[10px] text-text-muted mt-1',
};

interface NewsItem {
  id: string;
  title: string;
  date: string;
  cover?: string;
}

interface Props {
  items: NewsItem[];
}

export default function AnimeNewsCard({ items }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>Anime News</p>
      {items.map(n => (
        <div key={n.id} className={styles.item}>
          {n.cover
            ? <img src={n.cover} alt="" className={styles.cover} />
            : <div className={styles.cover} />
          }
          <div>
            <p className={styles.text}>{n.title}</p>
            <p className={styles.date}>{n.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
