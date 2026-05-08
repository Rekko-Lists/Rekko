interface Cover {
  id: string;
  title: string;
  cover?: string;
}

interface Props {
  animes: Cover[];
  showAddBtn?: boolean;
}

const styles = {
  wrap:    'flex gap-2',
  item:    'flex flex-col gap-1',
  poster:  'w-[69px] h-[97px] rounded-card overflow-hidden bg-gradient-to-br from-slate-500 to-slate-800 flex-shrink-0',
  img:     'w-full h-full object-cover',
  addBtn:  'w-[69px] bg-border-light rounded-[3px] text-[10px] text-text-secondary text-center py-0.5 cursor-pointer hover:bg-border transition-colors',
};

export default function AnimeCovers({ animes, showAddBtn = true }: Props) {
  return (
    <div className={styles.wrap}>
      {animes.map(a => (
        <div key={a.id} className={styles.item}>
          <div className={styles.poster}>
            {a.cover
              ? <img src={a.cover} alt={a.title} className={styles.img} />
              : null
            }
          </div>
          {showAddBtn && <button className={styles.addBtn}>+Add to list</button>}
        </div>
      ))}
    </div>
  );
}
