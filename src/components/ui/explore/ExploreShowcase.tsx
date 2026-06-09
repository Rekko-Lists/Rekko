import { Link } from 'react-router-dom';
import type { PostDetailData } from '@/lib/postService';
import type { Anime } from '@/types/anime';
import ExplorePostPreviewCard from './ExplorePostPreviewCard';
import ExploreRecommendationCard, { type ExploreRecommendationItem } from './ExploreRecommendationCard';
import ExploreWeeklyCalendar from './ExploreWeeklyCalendar';

export interface ExploreSeasonalItem {
  id: string;
  title: string;
  cover?: string;
  synopsis?: string;
  score?: number;
  meta?: string;
}

interface Props {
  seasonal: ExploreSeasonalItem[];
  popular: ExploreSeasonalItem[];
  weeklyAiring: Anime[];
  latestPosts: PostDetailData[];
  popularRecommendations: ExploreRecommendationItem[];
}

const styles = {
  shell: 'relative flex min-h-[calc(100vh-138px)] flex-col overflow-hidden rounded-none border border-border bg-surface',
  banner: 'relative flex h-[164px] items-center overflow-hidden bg-[#FF8A00]',
  bannerClouds: 'absolute inset-0 pointer-events-none bg-[url("/bg-clouds-banner.png")] bg-cover bg-center bg-no-repeat opacity-100',
  bannerLogo: 'relative z-10 ml-[11%] w-[260px] max-w-[42vw] object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.18)]',
  bannerSword: 'absolute right-[6%] top-1/2 z-10 h-[138px] translate-y-[-40%] translate-x-[-15%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]',
  body: 'flex flex-1 flex-col px-8 pb-10 pt-8',
  titleWrap: 'flex flex-col items-center',
  title: 'text-[40px] font-medium leading-none text-text-main',
  underline: 'mt-2 h-0.5 w-[205px] bg-primary',
  grid: 'mt-8 grid grid-cols-[repeat(auto-fit,minmax(105px,1fr))] gap-x-5 gap-y-8 justify-items-center xl:grid-cols-[repeat(auto-fit,minmax(168px,1fr))] 2xl:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]',
  miniGrid: 'mt-6 grid grid-cols-[repeat(auto-fit,minmax(95px,1fr))] gap-x-5 gap-y-7 justify-items-center xl:grid-cols-[repeat(auto-fit,minmax(158px,1fr))] 2xl:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]',
  sectionTitle: 'mt-12 text-center text-[30px] font-medium leading-none text-text-main',
  sectionUnderline: 'mx-auto mt-2 h-0.5 w-[150px] bg-primary',
  animeCard: 'group flex w-full max-w-[160px] flex-col items-center gap-3 font-gabarito xl:max-w-[255px]',
  animeCoverWrap: 'relative w-full overflow-hidden rounded-[3px] bg-gradient-to-br from-slate-300 via-slate-500 to-slate-800 aspect-[173/245] shadow-sm',
  animeCover: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
  animeFallback: 'flex h-full w-full items-end p-3 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_48%),linear-gradient(145deg,#98a7bd,#4a5568_72%,#212834)]',
  animeOverlay: 'absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
  animeOverlayTitle: 'text-sm font-semibold leading-tight text-white',
  animeMeta: 'mt-1 text-[11px] text-white/80',
  animeSynopsis: 'mt-2 line-clamp-5 text-[11px] leading-snug text-white/85',
  animeTitle: 'text-center text-[15px] font-medium leading-snug text-text-main',
  postRow: 'mt-6 grid grid-cols-1 gap-5 md:grid-cols-3',
  recRow: 'mt-8 grid grid-cols-1 gap-x-7 gap-y-10 md:grid-cols-3',
  more: 'mt-auto text-center text-sm text-primary hover:underline leading-none pt-8',
};

function AnimeCard({ item }: { item: ExploreSeasonalItem }) {
  return (
    <Link to={`/animes/${item.id}`} className={styles.animeCard}>
      <div className={styles.animeCoverWrap}>
        {item.cover ? (
          <img src={item.cover} alt={item.title} className={styles.animeCover} />
        ) : (
          <div className={styles.animeFallback}>
            <span className="text-sm leading-tight text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{item.title}</span>
          </div>
        )}
        <div className={styles.animeOverlay}>
          <h3 className={styles.animeOverlayTitle}>{item.title}</h3>
          <p className={styles.animeMeta}>{item.score != null ? `Score ${item.score}` : 'Score TBA'}{item.meta ? ` · ${item.meta}` : ''}</p>
          {item.synopsis ? <p className={styles.animeSynopsis}>{item.synopsis}</p> : null}
        </div>
      </div>
      <p className={styles.animeTitle}>{item.title}</p>
    </Link>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div>
      <h3 className={styles.sectionTitle}>{children}</h3>
      <div className={styles.sectionUnderline} />
    </div>
  );
}

export default function ExploreShowcase({
  seasonal,
  popular,
  weeklyAiring,
  latestPosts,
  popularRecommendations,
}: Props) {
  return (
    <section className={styles.shell}>
      <div className={styles.banner}>
        <div className={styles.bannerClouds} aria-hidden="true" />
        <img src="/RekkoText.png" alt="Rekko" className={styles.bannerLogo} />
        <img src="/RekkoSwordBanner.png" alt="" aria-hidden="true" className={styles.bannerSword} />
      </div>

      <div className={styles.body}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Seasonal Anime</h2>
          <div className={styles.underline} />
        </div>

        <div className={styles.grid}>
          {seasonal.map((item) => (
            <AnimeCard key={item.id} item={item} />
          ))}
        </div>

        {popular.length > 0 ? (
          <>
            <SectionTitle>Popular This Week</SectionTitle>
            <div className={styles.miniGrid}>
              {popular.map((item) => (
                <AnimeCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : null}

        <ExploreWeeklyCalendar animes={weeklyAiring} />

        {latestPosts.length > 0 ? (
          <>
            <SectionTitle>Fresh Community Posts</SectionTitle>
            <div className={styles.postRow}>
              {latestPosts.map((post) => (
                <ExplorePostPreviewCard key={post.postId} post={post} />
              ))}
            </div>
          </>
        ) : null}

        {popularRecommendations.length > 0 ? (
          <>
            <SectionTitle>Popular Recommendations</SectionTitle>
            <div className={styles.recRow}>
              {popularRecommendations.slice(0, 3).map((item) => (
                <ExploreRecommendationCard key={item.post.postId} item={item} />
              ))}
            </div>
          </>
        ) : null}

        <Link to="/animes" className={styles.more}>View More +</Link>
      </div>
    </section>
  );
}
