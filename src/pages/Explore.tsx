import ExploreShowcase, { type ExploreSeasonalItem } from '@/components/ui/explore/ExploreShowcase';
import ExploreCloudToggle from '@/components/ui/explore/ExploreCloudToggle';
import MovingCloudBackground from '@/components/ui/explore/MovingCloudBackground';
import TopRankedList, { type RankedAnimeItem } from '@/components/ui/anime/TopRankedList';
import { useState } from 'react';

const SEASONAL: ExploreSeasonalItem[] = [
  { id: '1', title: 'Frieren: Beyond Journey\'s End Season 2' },
  { id: '2', title: 'Jujutsu Kaisen: Shimetsu Kaiyuu - Zenpen' },
  { id: '3', title: 'Jigokuraku 2nd Season' },
  { id: '4', title: 'Sentenced to be a Hero' },
];

const TOP_AIRING: RankedAnimeItem[] = [
  { id: 'airing-1', rank: 1, title: 'Frieren: Beyond Journey\'s End Season 2' },
  { id: 'airing-2', rank: 2, title: '[Oshi no Ko] 3rd Season' },
];

const TOP_UPCOMING: RankedAnimeItem[] = [
  { id: 'upcoming-1', rank: 1, title: 'Cyberpunk: Edgerunners 2' },
  { id: 'upcoming-2', rank: 2, title: 'Youjo Senki II' },
];

const styles = {
  page: 'relative min-h-full overflow-hidden bg-app-bg px-4 pb-6 font-gabarito md:px-8 xl:px-[6%]',
  layout: 'relative z-10 grid min-h-[calc(100vh-138px-24px)] grid-cols-1 gap-4 xl:grid-cols-[281px_minmax(0,1fr)_281px] xl:items-stretch',
  sideRank: 'w-full xl:w-auto',
  sideUp: 'xl:self-start xl:mt-6',
  sideDown: 'xl:self-end',
  centerCol: 'w-full min-w-0 self-stretch',
};

export default function Explore() {
  const [cloudsEnabled, setCloudsEnabled] = useState(true);

  return (
    <div className={styles.page}>
      <MovingCloudBackground enabled={cloudsEnabled} />
      <ExploreCloudToggle enabled={cloudsEnabled} onToggle={() => setCloudsEnabled((value) => !value)} />

      <div className={styles.layout}>
        <aside className={`${styles.sideRank} ${styles.sideDown}`}>
          <TopRankedList title="Top Upcoming" items={TOP_UPCOMING} />
        </aside>

        <main className={styles.centerCol}>
          <ExploreShowcase items={SEASONAL} />
        </main>

        <aside className={`${styles.sideRank} ${styles.sideUp}`}>
          <TopRankedList title="Top Airing" items={TOP_AIRING} />
        </aside>
      </div>
    </div>
  );
}
