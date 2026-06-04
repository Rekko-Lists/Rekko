import { Link } from 'react-router-dom';
import type { Anime } from '@/types/anime';
import { groupAnimesByLocalBroadcastDay, WEEK_DAYS } from './ExploreSchedule.ts';

interface Props {
  animes: Anime[];
}

const styles = {
  section: 'mt-12',
  frame:
    'relative overflow-hidden rounded-[20px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,244,244,0.88))] p-4 shadow-[0_18px_50px_rgba(33,40,52,0.10)] md:p-5',
  glow: 'pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl',
  cloud:
    'pointer-events-none absolute inset-x-0 top-0 h-32 bg-[url("/bg-clouds-banner.png")] bg-cover bg-center opacity-70',
  header: 'relative z-10 mb-5 flex flex-col items-center text-center',
  eyebrow: 'text-[11px] font-black uppercase tracking-[0.3em] text-primary',
  title: 'mt-1 text-[30px] font-medium leading-none text-text-main md:text-[34px]',
  subtitle: 'mt-2 max-w-[620px] text-sm leading-snug text-text-muted',
  grid: 'relative z-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 min-[1800px]:grid-cols-7',
  day: 'min-h-[160px] rounded-[14px] border border-border-light bg-app-bg/85 p-3 transition hover:-translate-y-0.5 hover:shadow-card',
  dayToday: 'border-primary/60 bg-primary/10 shadow-[0_8px_22px_rgba(255,158,0,0.16)]',
  dayTitle: 'mb-3 flex items-center justify-between gap-2 text-sm font-black text-text-main',
  count: 'rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-primary shadow-sm',
  list: 'flex flex-col gap-2',
  item: 'group flex items-center gap-2 rounded-[10px] bg-surface p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-card',
  cover: 'h-12 w-8 flex-shrink-0 rounded-[4px] bg-gradient-to-br from-slate-300 to-slate-700 object-cover',
  itemBody: 'min-w-0 flex-1',
  itemTitle: 'line-clamp-2 text-[12px] font-semibold leading-tight text-text-main group-hover:text-primary',
  itemTime: 'mt-0.5 text-[10px] font-bold text-primary-dark',
  empty:
    'rounded-[10px] border border-dashed border-border-light bg-surface/60 px-3 py-6 text-center text-[12px] text-text-muted',
  overflow: 'pt-1 text-center text-[11px] font-bold text-primary-dark',
};

function getTodayName() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
}

export default function ExploreWeeklyCalendar({ animes }: Props) {
  const grouped = groupAnimesByLocalBroadcastDay(animes);
  const today = getTodayName();

  return (
    <section className={styles.section}>
      <div className={styles.frame}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.cloud} aria-hidden="true" />
        <div className={styles.header}>
          <p className={styles.eyebrow}>Weekly airing calendar</p>
          <h3 className={styles.title}>This week on Rekko</h3>
          <p className={styles.subtitle}>
            Airing anime pulled from the catalogue and placed into the correct local day from their JST broadcast slot.
          </p>
        </div>

        <div className={styles.grid}>
          {WEEK_DAYS.map((day) => {
            const items = grouped.get(day) ?? [];
            const isToday = day === today;

            return (
              <article key={day} className={`${styles.day} ${isToday ? styles.dayToday : ''}`}>
                <h4 className={styles.dayTitle}>
                  <span>{day}</span>
                  <span className={styles.count}>{items.length}</span>
                </h4>

                {items.length > 0 ? (
                  <div className={styles.list}>
                    {items.slice(0, 5).map(({ anime, broadcast }) => (
                      <Link key={anime.malId} to={`/animes/${anime.malId}`} className={styles.item}>
                        {anime.imgMedium || anime.imgLarge ? (
                          <img src={anime.imgMedium || anime.imgLarge} alt="" className={styles.cover} />
                        ) : (
                          <div className={styles.cover} />
                        )}
                        <span className={styles.itemBody}>
                          <span className={styles.itemTitle}>{anime.name}</span>
                          <span className={styles.itemTime}>{broadcast.time}</span>
                        </span>
                      </Link>
                    ))}
                    {items.length > 5 ? <p className={styles.overflow}>+{items.length - 5} more airing</p> : null}
                  </div>
                ) : (
                  <p className={styles.empty}>Quiet day</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
