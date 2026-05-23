import { Plus } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  cover?: string;
}

interface Props {
  items: NewsItem[];
  onViewAll?: () => void;
}

const styles = {
  card:    'w-full bg-surface border-[1.5px] border-border rounded-card p-3 font-gabarito',
  title:   'text-[14px] text-text-main mb-2 leading-none',
  row:     'flex items-start gap-4',
  list:    'flex-1 flex gap-4 overflow-x-auto',
  item:    'flex gap-2 flex-shrink-0 w-[200px]',
  cover:   'w-[44px] h-[69px] flex-shrink-0 bg-gradient-to-br from-slate-400 to-slate-700 rounded-[3px] object-cover',
  text:    'text-[11px] text-text-main leading-snug line-clamp-3',
  date:    'text-[10px] text-text-muted mt-1',
  viewBtn: 'flex flex-col items-center justify-center w-[51px] h-[68px] bg-border-light rounded-btn text-[#788397] hover:bg-border transition-colors flex-shrink-0',
  viewTxt: 'text-[13px] leading-none mt-0.5',
  empty:   'text-text-muted text-sm py-4',
};

export default function AnimeNewsHorizontal({ items, onViewAll }: Props) {
  return (
    <section className={styles.card} aria-label="Anime News">
      <h2 className={styles.title}>Anime News</h2>
      <div className={styles.row}>
        {items.length === 0 ? (
          <div className={styles.empty}>No news available.</div>
        ) : (
          <div className={styles.list}>
            {items.map((n) => (
              <div key={n.id} className={styles.item}>
                {n.cover ? (
                  <img src={n.cover} alt="" className={styles.cover} />
                ) : (
                  <div className={styles.cover} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={styles.text}>{n.title}</p>
                  <p className={styles.date}>{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="button" className={styles.viewBtn} onClick={onViewAll} title="View all news">
          <Plus size={20} strokeWidth={1.5} />
          <span className={styles.viewTxt}>View</span>
        </button>
      </div>
    </section>
  );
}
