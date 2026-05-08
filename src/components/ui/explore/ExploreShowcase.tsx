import SeasonalAnimeCard from '@/components/ui/anime/SeasonalAnimeCard';

export interface ExploreSeasonalItem {
  id: string;
  title: string;
  cover?: string;
}

interface Props {
  items: ExploreSeasonalItem[];
}

const styles = {
  shell: 'relative flex min-h-[calc(100vh-138px)] flex-col overflow-hidden rounded-none border border-border bg-surface',
  banner: 'relative flex h-[164px] items-center overflow-hidden bg-[#FF8A00]',
  bannerClouds: 'absolute inset-0 pointer-events-none bg-[url("/bg_clouds.png")] bg-cover bg-center bg-no-repeat opacity-100',
  bannerLogo: 'relative z-10 ml-[11%] w-[260px] max-w-[42vw] object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.18)]',
  bannerSword: 'absolute right-[6%] top-1/2 z-10 h-[138px] translate-y-[-40%] translate-x-[-15%] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)]',
  body: 'flex flex-1 flex-col px-6 pb-8 pt-8',
  titleWrap: 'flex flex-col items-center',
  title: 'text-[40px] font-medium leading-none text-text-main',
  underline: 'mt-2 h-0.5 w-[205px] bg-primary',
  grid: 'mt-8 grid grid-cols-2 gap-x-6 gap-y-8 justify-items-center xl:grid-cols-4',
  more: 'mt-auto text-center text-sm text-primary hover:underline leading-none pt-8',
};

export default function ExploreShowcase({ items }: Props) {
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
          {items.map((item) => (
            <SeasonalAnimeCard key={item.id} title={item.title} cover={item.cover} />
          ))}
        </div>

        <p className={styles.more}>View More +</p>
      </div>
    </section>
  );
}
