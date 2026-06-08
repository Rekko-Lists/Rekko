import { Link } from 'react-router-dom';

interface RankedAnimeItem {
  id: string;
  rank: number;
  title: string;
  cover?: string;
}

interface Props {
  title: string;
  items: RankedAnimeItem[];
  moreLink?: string;
}

const styles = {
  card: 'bg-surface border border-border rounded-md px-4 py-3 font-gabarito',
  header: 'flex items-center justify-between gap-3 mb-3',
  title: 'text-[19px] font-medium text-text-main leading-none',
  more: 'text-sm text-primary hover:underline leading-none',
  item: 'flex items-start gap-3 py-3 border-b border-border last:border-0',
  rank: 'w-5 flex-shrink-0 text-[20px] font-medium text-text-main leading-none pt-1',
  coverWrap: 'relative w-[91px] h-[114px] flex-shrink-0 overflow-hidden rounded-none bg-gradient-to-br from-slate-300 via-slate-500 to-slate-800',
  coverAccent: 'absolute inset-y-0 left-0 w-[3px] bg-primary/80',
  cover: 'w-full h-full object-cover',
  fallback: 'flex h-full w-full items-end p-2 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_45%),linear-gradient(145deg,#92a0b3,#445166_70%,#212834)]',
  fallbackText: 'text-[11px] leading-tight text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]',
  text: 'min-w-0 flex-1 text-[13px] leading-snug text-text-main pt-1',
};

export type { RankedAnimeItem };

export default function TopRankedList({ title, items, moreLink }: Props) {
  return (
    <aside className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {moreLink ? (
          <Link to={moreLink} className={styles.more}>More +</Link>
        ) : (
          <button type="button" className={styles.more}>More +</button>
        )}
      </div>

      <div>
        {items.map((item) => (
          <Link key={item.id} to={`/animes/${item.id}`} className={styles.item} style={{ display: 'flex' }}>
            <span className={styles.rank}>{item.rank}</span>

            <div className={styles.coverWrap}>
              <div className={styles.coverAccent} />
              {item.cover ? (
                <img src={item.cover} alt={item.title} className={styles.cover} />
              ) : (
                <div className={styles.fallback}>
                  <span className={styles.fallbackText}>{item.title}</span>
                </div>
              )}
            </div>

            <p className={styles.text}>{item.title}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
