import ExploreShowcase, { type ExploreSeasonalItem } from '@/components/ui/explore/ExploreShowcase';
import ExploreCloudToggle from '@/components/ui/explore/ExploreCloudToggle';
import MovingCloudBackground from '@/components/ui/explore/MovingCloudBackground';
import TopRankedList, { type RankedAnimeItem } from '@/components/ui/anime/TopRankedList';
import type { ExploreRecommendationItem } from '@/components/ui/explore/ExploreRecommendationCard';
import {
  getPopularAnimes,
  getRecommendedAnimes,
  getTopAiringAnimes,
  getTopSeasonalAnimes,
  getTopUpcomingAnimes,
  getWeeklyAiringAnimes,
} from '@/lib/animeService';
import { getPopularPosts, getPosts, type PostDetailData } from '@/lib/postService';
import type { Anime } from '@/types/anime';
import { useEffect, useState } from 'react';

interface ExploreData {
  seasonal: Anime[];
  popular: Anime[];
  topAiring: Anime[];
  topUpcoming: Anime[];
  weeklyAiring: Anime[];
  latestPosts: PostDetailData[];
  popularRecommendations: ExploreRecommendationItem[];
}

const EMPTY_DATA: ExploreData = {
  seasonal: [],
  popular: [],
  topAiring: [],
  topUpcoming: [],
  weeklyAiring: [],
  latestPosts: [],
  popularRecommendations: [],
};

const styles = {
  page: 'relative min-h-full overflow-hidden bg-app-bg px-4 pb-6 font-gabarito md:px-8 xl:px-[6%]',
  layout: 'relative z-10 grid min-h-[calc(100vh-138px-24px)] grid-cols-1 gap-4 xl:grid-cols-[281px_minmax(0,1fr)_281px] xl:items-stretch',
  sideRank: 'w-full xl:w-auto',
  sideUp: 'xl:self-start xl:mt-6',
  sideDown: 'xl:self-end',
  centerCol: 'w-full min-w-0 self-stretch',
};

function toSeasonalItems(animes: Anime[]): ExploreSeasonalItem[] {
  return animes.map((anime) => ({
    id: String(anime.malId),
    title: anime.name,
    cover: anime.imgMedium || anime.imgLarge,
    synopsis: anime.synopsis,
    score: anime.malMean ?? anime.mean,
    meta: typeof anime.status === 'string' ? anime.status.replace(/_/g, ' ') : undefined,
  }));
}

function toRankedItems(animes: Anime[]): RankedAnimeItem[] {
  return animes.slice(0, 2).map((anime, index) => ({
    id: String(anime.malId),
    rank: index + 1,
    title: anime.name,
    cover: anime.imgMedium || anime.imgLarge,
  }));
}

async function loadExploreData(signal: AbortSignal): Promise<ExploreData> {
  const [seasonal, popular, topAiring, topUpcoming, weeklyAiring, latestPosts, popularPosts] = await Promise.allSettled([
    getTopSeasonalAnimes(6, signal),
    getPopularAnimes(6, signal),
    getTopAiringAnimes(2, signal),
    getTopUpcomingAnimes(2, signal),
    getWeeklyAiringAnimes(110, signal),
    getPosts({ page: 1, limit: 3, sortField: 'createdAt', sortOrder: 'desc' }, signal).then((page) => page.posts),
    getPopularPosts(3, signal),
  ]);

  const popularPostItems = popularPosts.status === 'fulfilled' ? popularPosts.value : [];
  const popularRecommendations = await Promise.all(
    popularPostItems.map(async (post) => {
      const sourceAnime = post.animes[0];
      if (!sourceAnime) return { post, sourceAnime: undefined, relatedAnimes: [] };

      try {
        const recommended = await getRecommendedAnimes(sourceAnime.malId, { page: 1, limit: 4 }, signal);
        return {
          post,
          sourceAnime,
          relatedAnimes: recommended.items.filter((anime) => anime.malId !== sourceAnime.malId).slice(0, 3),
        };
      } catch {
        return { post, sourceAnime, relatedAnimes: [] };
      }
    }),
  );

  return {
    seasonal: seasonal.status === 'fulfilled' ? seasonal.value : [],
    popular: popular.status === 'fulfilled' ? popular.value : [],
    topAiring: topAiring.status === 'fulfilled' ? topAiring.value : [],
    topUpcoming: topUpcoming.status === 'fulfilled' ? topUpcoming.value : [],
    weeklyAiring: weeklyAiring.status === 'fulfilled' ? weeklyAiring.value : [],
    latestPosts: latestPosts.status === 'fulfilled' ? latestPosts.value : [],
    popularRecommendations,
  };
}

export default function Explore() {
  const [cloudsEnabled, setCloudsEnabled] = useState(true);
  const [data, setData] = useState<ExploreData>(EMPTY_DATA);

  useEffect(() => {
    const controller = new AbortController();

    loadExploreData(controller.signal).then((nextData) => {
      if (!controller.signal.aborted) setData(nextData);
    });

    return () => controller.abort();
  }, []);

  return (
    <div className={styles.page}>
      <MovingCloudBackground enabled={cloudsEnabled} />
      <ExploreCloudToggle enabled={cloudsEnabled} onToggle={() => setCloudsEnabled((value) => !value)} />

      <div className={styles.layout}>
        <aside className={`${styles.sideRank} ${styles.sideDown}`}>
          <TopRankedList title="Top Upcoming" items={toRankedItems(data.topUpcoming)} />
        </aside>

        <main className={styles.centerCol}>
          <ExploreShowcase
            seasonal={toSeasonalItems(data.seasonal)}
            popular={toSeasonalItems(data.popular)}
            weeklyAiring={data.weeklyAiring}
            latestPosts={data.latestPosts}
            popularRecommendations={data.popularRecommendations}
          />
        </main>

        <aside className={`${styles.sideRank} ${styles.sideUp}`}>
          <TopRankedList title="Top Airing" items={toRankedItems(data.topAiring)} />
        </aside>
      </div>
    </div>
  );
}
