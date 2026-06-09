import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAnimeDetail } from "@/hooks/useAnimeDetail";
import { useAnimePosts } from "@/hooks/useAnimePosts";
import { useSimilarAnimes } from "@/hooks/useSimilarAnimes";
import { useRecommendedAnimes } from "@/hooks/useRecommendedAnimes";
import { useRelatedAnimes } from "@/hooks/useRelatedAnimes";
import { useAnimeUserActions } from "@/hooks/useAnimeUserActions";
import HeroCard from "@/components/ui/anime-detail/HeroCard";
import AnimeStatsRow from "@/components/ui/anime-detail/AnimeStatsRow";
import EpisodeRatingInputs from "@/components/ui/anime-detail/EpisodeRatingInputs";
import AnimeInfoSection from "@/components/ui/anime-detail/AnimeInfoSection";
import AnimeSynopsis from "@/components/ui/anime-detail/AnimeSynopsis";
import PostsCarousel from "@/components/ui/anime-detail/PostsCarousel";
import SimilarAnimes from "@/components/ui/anime-detail/SimilarAnimes";
import RelatedAnimes from "@/components/ui/anime-detail/RelatedAnimes";
import AnimeNewsHorizontal from "@/components/ui/anime-detail/AnimeNewsHorizontal";
import PersonalRecommendation from "@/components/ui/anime-detail/PersonalRecommendation";
import RecommendedAnimesFooter from "@/components/ui/anime-detail/RecommendedAnimesFooter";
import { getAnimeNews, type AnimeNewsItem } from "@/lib/animeNewsService";
import Seo from "@/components/seo/Seo";
import { absoluteUrl, pageJsonLd } from "@/components/seo/jsonLd";

const styles = {
  page: "min-h-full bg-app-bg font-gabarito relative overflow-x-hidden",
  bgClouds:
    "hidden min-[1900px]:block min-[2600px]:hidden absolute inset-x-0 bottom-0 z-0 h-[clamp(450px,23.44vw,600px)] w-full bg-no-repeat bg-[length:100%_auto] pointer-events-none",
  container: "relative z-10 max-w-[1500px] mx-auto px-[6%] py-8",
  rowMain: "grid grid-cols-1 gap-8 items-start xl:grid-cols-[209px_minmax(0,1fr)]",
  leftCol: "flex flex-col gap-3",
  contentGrid: "grid grid-cols-1 gap-y-6 items-start xl:grid-cols-[minmax(0,1fr)_430px] xl:gap-x-8",
  topHeader:
    "grid grid-cols-1 gap-y-3 items-end border-b border-border pb-3 xl:col-span-2 xl:grid-cols-[minmax(0,1fr)_430px] xl:gap-x-8",
  animeTitle: "text-[20px] text-text-main text-center leading-none",
  recPanel: "flex h-full min-h-[252px] flex-col",
  recHeader: "flex items-baseline justify-between mb-2",
  recTitle: "text-[20px] text-text-main leading-none",
  recLink:
    "text-[13px] font-medium text-primary hover:text-primary-dark hover:underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0 leading-none transition-colors",
  topBody:
    "grid grid-cols-1 gap-y-6 items-stretch pt-3 xl:col-span-2 xl:grid-cols-[minmax(0,1fr)_430px] xl:gap-x-8",
  rowDivider: "h-px bg-border my-7 xl:col-start-1",
  bottomBody:
    "grid grid-cols-1 gap-y-6 items-start xl:col-span-2 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-x-8",
  fullRow: "mt-8",
  personalRow: "mt-8 flex justify-center",
  footerRow: "mt-8 mb-40",
  loading: "min-h-screen flex items-center justify-center text-text-muted",
  notFound:
    "min-h-screen flex flex-col items-center justify-center gap-3 text-center",
  notFoundTtl: "text-2xl font-semibold text-text-main",
  notFoundSub: "text-text-muted",
  backLink:
    "mt-2 px-4 py-2 bg-primary text-white rounded-btn hover:bg-primary-dark transition-colors",
  error:
    "min-h-screen flex flex-col items-center justify-center gap-3 text-status-red",
};

export default function AnimeDetail() {
  const { malId: malIdParam } = useParams<{ malId: string }>();
  const navigate = useNavigate();
  const malId = malIdParam ? parseInt(malIdParam, 10) : undefined;
  const [news, setNews] = useState<AnimeNewsItem[]>([]);

  // TODO(backend): GET /anime/:malId debe incluir userState.watchedEpisodes para
  // que el progreso de episodios persista al recargar. El optimistic update local
  // funciona, pero al refrescar el campo vuelve a 0 hasta que se arregle el
  // backend (buildUserStateMap en AnimeService).
  const { anime, loading, error, notFound } = useAnimeDetail(malId);
  const userActions = useAnimeUserActions(anime);
  const { posts, loading: postsLoading } = useAnimePosts(malId);
  const { animes: similar, loading: similarLoading } = useSimilarAnimes(malId);
  const { animes: recommended, loading: recommendedLoading } =
    useRecommendedAnimes(malId);
  const { relations: related, loading: relatedLoading } =
    useRelatedAnimes(malId);

  useEffect(() => {
    if (malId === undefined) {
      setNews([]);
      return;
    }

    const controller = new AbortController();
    getAnimeNews(malId, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setNews(items.slice(0, 5));
      })
      .catch(() => {
        if (!controller.signal.aborted) setNews([]);
      });

    return () => controller.abort();
  }, [malId]);

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTtl}>Anime not found</h1>
        <p className={styles.notFoundSub}>
          The anime you’re looking for doesn’t exist.
        </p>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => navigate("/animes")}
        >
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
        <p>{error ?? "Failed to load anime."}</p>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => navigate("/animes")}
        >
          Browse catalogue
        </button>
      </div>
    );
  }

  const disabledReason = userActions.isAuthenticated
    ? undefined
    : "Sign in to save";

  return (
    <div className={styles.page}>
      <Seo
        title={anime.name}
        description={
          anime.synopsis?.slice(0, 155) ||
          `View ${anime.name} details, synopsis, stats, recommendations, related anime, and community posts on Rekko.`
        }
        canonicalPath={`/animes/${anime.malId}`}
        image={anime.imgLarge || anime.imgMedium || "/rekko_logo.png"}
        jsonLd={[
          pageJsonLd({
            type: "ProfilePage",
            path: `/animes/${anime.malId}`,
            name: anime.name,
            description:
              anime.synopsis ||
              `Anime details, stats, recommendations, and community posts for ${anime.name}.`,
            image: anime.imgLarge || anime.imgMedium,
          }),
          {
            "@context": "https://schema.org",
            "@type": "TVSeries",
            name: anime.name,
            description: anime.synopsis,
            image: absoluteUrl(anime.imgLarge || anime.imgMedium || "/rekko_logo.png"),
            url: absoluteUrl(`/animes/${anime.malId}`),
            numberOfEpisodes: anime.numEpisodes || undefined,
            aggregateRating:
              (anime.mean ?? anime.malMean ?? 0) > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: anime.mean ?? anime.malMean,
                    bestRating: 10,
                  }
                : undefined,
          },
        ]}
      />
      <div
        className={styles.bgClouds}
        style={{
          backgroundImage: "url(/rekko_clouds_fullhd.png)",
          backgroundPosition: "center clamp(-370px,-14.45vw,-278px)",
        }}
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
              members={userActions.members}
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

          <div className={styles.contentGrid}>
            <div className={styles.topHeader}>
              <h1 className={styles.animeTitle}>{anime.name}</h1>
              <div />
            </div>

            <div className={styles.topBody}>
              <AnimeSynopsis
                title={anime.name}
                synopsis={anime.synopsis}
                showTitle={false}
                showDivider={false}
              />
              <div className={styles.recPanel}>
                <div className={styles.recHeader}>
                  <h2 className={styles.recTitle}>Recommendations:</h2>
                  {malId !== undefined && (
                    <button
                      type="button"
                      className={styles.recLink}
                      onClick={() => navigate(`/animes/${malId}/posts`)}
                    >
                      Show more
                    </button>
                  )}
                </div>
                {malId !== undefined && (
                  <PostsCarousel
                    posts={posts}
                    loading={postsLoading}
                    malId={malId}
                    showHeader={false}
                    currentAnime={{
                      id: anime.malId,
                      title: anime.name,
                      cover: anime.imgMedium || anime.imgLarge,
                    }}
                  />
                )}
              </div>
            </div>

            <div className={styles.rowDivider} />

            <div className={styles.bottomBody}>
              {malId !== undefined && (
                <RelatedAnimes
                  relations={related}
                  loading={relatedLoading}
                  malId={malId}
                />
              )}
              {malId !== undefined && (
                <SimilarAnimes
                  animes={similar}
                  loading={similarLoading}
                  malId={malId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Anime news horizontal */}
        <div className={styles.fullRow}>
          <AnimeNewsHorizontal items={news} />
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
