interface Props {
  title: string;
  cover?: string;
}

const styles = {
  card: 'flex w-full max-w-[173px] flex-col items-center gap-3 font-gabarito',
  coverWrap: 'relative w-full overflow-hidden rounded-none bg-gradient-to-br from-slate-300 via-slate-500 to-slate-800 aspect-[173/245]',
  cover: 'h-full w-full object-cover',
  fallback: 'flex h-full w-full items-end p-3 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_48%),linear-gradient(145deg,#98a7bd,#4a5568_72%,#212834)]',
  fallbackText: 'text-sm leading-tight text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]',
  title: 'text-center text-[13px] leading-snug text-text-main',
};

export default function SeasonalAnimeCard({ title, cover }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.coverWrap}>
        {cover ? (
          <img src={cover} alt={title} className={styles.cover} />
        ) : (
          <div className={styles.fallback}>
            <span className={styles.fallbackText}>{title}</span>
          </div>
        )}
      </div>
      <p className={styles.title}>{title}</p>
    </article>
  );
}
