import { useNavigate, useParams } from 'react-router-dom';
import { useAnimeDetail } from '@/hooks/useAnimeDetail';
import { useAnimePosts } from '@/hooks/useAnimePosts';
import { useSimilarAnimes } from '@/hooks/useSimilarAnimes';
import { useRecommendedAnimes } from '@/hooks/useRecommendedAnimes';
import { useAnimeUserActions } from '@/hooks/useAnimeUserActions';
import HeroCard from '@/components/ui/anime-detail/HeroCard';
import AnimeStatsRow from '@/components/ui/anime-detail/AnimeStatsRow';
import EpisodeRatingInputs from '@/components/ui/anime-detail/EpisodeRatingInputs';
import AnimeInfoSection from '@/components/ui/anime-detail/AnimeInfoSection';
import AnimeSynopsis from '@/components/ui/anime-detail/AnimeSynopsis';
import PostsCarousel from '@/components/ui/anime-detail/PostsCarousel';
import SimilarAnimes from '@/components/ui/anime-detail/SimilarAnimes';
import AnimeNewsHorizontal from '@/components/ui/anime-detail/AnimeNewsHorizontal';
import PersonalRecommendation from '@/components/ui/anime-detail/PersonalRecommendation';
import RecommendedAnimesFooter from '@/components/ui/anime-detail/RecommendedAnimesFooter';

const styles = {
  page:         'min-h-full bg-app-bg font-gabarito relative',
  bgClouds:     'absolute inset-x-0 top-[400px] h-[1075px] bg-no-repeat bg-cover bg-center opacity-30 pointer-events-none -z-0',
  container:    'relative z-10 max-w-[1500px] mx-auto px-[6%] py-8',
  rowMain:      'grid grid-cols-[209px_1fr_360px] gap-8 items-start',
  leftCol:      'flex flex-col gap-3',
  centerCol:    'flex flex-col gap-4',
  rightCol:     'flex flex-col gap-4',
  centerRow:    'mt-8 grid grid-cols-[1fr_360px] gap-8 items-start',
  fullRow:      'mt-8',
  personalRow:  'mt-8 flex justify-center',
  footerRow:    'mt-8',
  loading:      'min-h-screen flex items-center justify-center text-text-muted',
  notFound:     'min-h-screen flex flex-col items-center justify-center gap-3 text-center',
  notFoundTtl:  'text-2xl font-semibold text-text-main',
  notFoundSub:  'text-text-muted',
  backLink:     'mt-2 px-4 py-2 bg-primary text-white rounded-btn hover:bg-primary-dark transition-colors',
  error:        'min-h-screen flex flex-col items-center justify-center gap-3 text-status-red',
};

export default function AnimeDetail() {
  const { malId: malIdParam } = useParams<{ malId: string }>();
  const navigate = useNavigate();
  const malId = malIdParam ? parseInt(malIdParam, 10) : undefined;

  const { anime, loading, error, notFound } = useAnimeDetail(malId);
  const userActions = useAnimeUserActions(anime);
  const { posts, loading: postsLoading } = useAnimePosts(malId);
  const { animes: similar, loading: similarLoading } = useSimilarAnimes(malId);
  const { animes: recommended, loading: recommendedLoading } = useRecommendedAnimes(malId);

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTtl}>Anime not found</h1>
        <p className={styles.notFoundSub}>The anime you’re looking for doesn’t exist.</p>
        <button type="button" className={styles.backLink} onClick={() => navigate('/animes')}>
          Browse catalogue
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className={styles.loading}>Loading anime…</div>;
  }

  if (error || !anime) {
    return (
      <div className={styles.error}>
        <p>{error ?? 'Failed to load anime.'}</p>
        <button type="button" className={styles.backLink} onClick={() => navigate('/animes')}>
          Browse catalogue
        </button>
      </div>
    );
  }

  const disabledReason = userActions.isAuthenticated ? undefined : 'Sign in to save';

  return (
    <div className={styles.page}>
      <div
        className={styles.bgClouds}
        style={{ backgroundImage: 'url(/bg_clouds.png)' }}
        aria-hidden
      />
      <div className={styles.container}>
        <div className={styles.rowMain}>
          {/* Left column — Hero + stats + episode/rating + info */}
          <div className={styles.leftCol}>
            <HeroCard
              imgLarge={anime.imgLarge || anime.imgMedium}
              name={anime.name}
              watchState={userActions.watchState}
              onChangeState={userActions.setWatchState}
              disabled={!userActions.isAuthenticated}
              disabledReason={disabledReason}
            />
            <AnimeStatsRow
              mean={anime.mean ?? anime.malMean ?? 0}
              likes={userActions.likes}
              liked={userActions.liked}
              inListCount={userActions.inListCount}
              completedCount={anime.completedCount}
              onToggleLike={userActions.toggleLike}
              canLike={userActions.isAuthenticated}
            />
            <EpisodeRatingInputs
              totalEpisodes={anime.numEpisodes}
              episodeProgress={userActions.episodeProgress}
              rating={userActions.rating}
              onEpisodesChange={userActions.setEpisodeProgress}
              onRatingChange={userActions.setRating}
              disabled={!userActions.isAuthenticated}
            />
            <AnimeInfoSection anime={anime} />
          </div>

          {/* Center column — synopsis */}
          <div className={styles.centerCol}>
            <AnimeSynopsis title={anime.name} synopsis={anime.synopsis} />
          </div>

          {/* Right column — posts carousel */}
          <div className={styles.rightCol}>
            {malId !== undefined && (
              <PostsCarousel posts={posts} loading={postsLoading} malId={malId} />
            )}
          </div>
        </div>

        {/* Second row: similar animes on the right */}
        <div className={styles.centerRow}>
          <div /> {/* spacer — left column already filled by info card above */}
          {malId !== undefined && (similar.length > 0 || similarLoading) && (
            <SimilarAnimes animes={similar} loading={similarLoading} malId={malId} />
          )}
        </div>

        {/* Anime news horizontal */}
        <div className={styles.fullRow}>
          <AnimeNewsHorizontal items={[]} />
        </div>

        {/* Personal recommendation */}
        <div className={styles.personalRow}>
          <PersonalRecommendation />
        </div>

        {/* Recommended footer */}
        {malId !== undefined && (
          <div className={styles.footerRow}>
            <RecommendedAnimesFooter
              animes={recommended}
              loading={recommendedLoading}
              malId={malId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
