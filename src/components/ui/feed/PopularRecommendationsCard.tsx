import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const styles = {
  card:    'bg-surface border-[1.5px] border-border rounded-card p-4',
  cardFlat:'px-1 py-2 font-gabarito',
  title:   'text-sm font-normal text-text-main mb-3',
  titleFlat:'text-sm font-semibold text-text-main border-b-2 border-primary pb-0.5 w-fit mb-3',
  item:    'flex gap-2 items-center mb-2 last:mb-0',
  cover:   'w-[35px] h-[50px] bg-gradient-to-br from-slate-400 to-slate-700 rounded-[3px] flex-shrink-0',
  hearts:  'flex items-center gap-0.5 text-[10px] text-text-secondary mt-0.5',
};

export interface RecommendationItem {
  id: string;
  title: string;
  cover?: string;
  hearts: number;
}

interface Props {
  items: RecommendationItem[];
  /** Mobile in-feed mode: render without card background/border. */
  flat?: boolean;
}

export default function PopularRecommendationsCard({ items, flat = false }: Props) {
  return (
    <div className={flat ? styles.cardFlat : styles.card}>
      <p className={flat ? styles.titleFlat : styles.title}>Popular recommendations</p>
      {items.map(item => (
        <Link key={item.id} to={`/post/${item.id}`} className={styles.item}>
          {item.cover
            ? <img src={item.cover} alt={item.title} className={styles.cover} />
            : <div className={styles.cover} />
          }
          <div>
            <p className="text-xs text-text-main leading-snug">{item.title}</p>
            <span className={styles.hearts}>
              <Heart size={10} fill="#FF9E00" className="text-primary" /> {item.hearts}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
