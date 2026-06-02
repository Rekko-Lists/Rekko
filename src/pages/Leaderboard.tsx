import { useEffect, useState } from "react";
import AnimeNewsCard from "@/components/ui/feed/AnimeNewsCard";
import PopularRecommendationsCard, { type RecommendationItem } from "@/components/ui/feed/PopularRecommendationsCard";
import LeaderboardPodium from "@/components/ui/leaderboard/LeaderboardPodium";
import LeaderboardList from "@/components/ui/leaderboard/LeaderboardList";
import CloudFooterBackground from "@/components/ui/leaderboard/CloudFooterBackground";
import { getTopReputationUsers, type ReputationUser } from "@/lib/userService";
import { getLatestAnimeNews, type AnimeNewsItem } from "@/lib/animeNewsService";
import { getPopularPosts } from "@/lib/postService";

const NEWS_FALLBACK_MAL_IDS = [52991, 5114, 9253, 30276];

const styles = {
  page: "relative mx-auto grid min-h-[calc(100vh-136px)] w-full max-w-[1608px] grid-cols-1 gap-6 overflow-hidden px-4 py-0 font-gabarito lg:grid-cols-[260px_minmax(0,1040px)_260px]",
  side: "relative z-10 flex flex-col justify-start gap-4 py-6 lg:sticky lg:top-[136px] lg:h-[calc(100vh-136px)] lg:overflow-y-auto",
  main: "relative z-10 flex min-h-[calc(100vh-136px)] min-w-0 items-center justify-center py-0",
  card: "flex min-h-[calc(100vh-136px)] w-full flex-col justify-center overflow-hidden border-x border-border bg-surface/85 px-6 py-10 shadow-[0_20px_80px_rgba(0,0,0,0.06)]",
  eyebrow: "text-center text-xs font-semibold uppercase tracking-[0.32em] text-primary",
  title: "leaderboard-title mt-2 text-center text-[42px] font-black leading-none text-text-main",
  subtitle: "mx-auto mt-3 max-w-[560px] text-center text-sm text-text-muted",
};

export default function Leaderboard() {
  const [users, setUsers] = useState<ReputationUser[]>([]);
  const [news, setNews] = useState<AnimeNewsItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void getTopReputationUsers(50, controller.signal).then((items) => {
      if (!controller.signal.aborted) setUsers(items);
    });
    void getLatestAnimeNews(NEWS_FALLBACK_MAL_IDS, 5, controller.signal).then((items) => {
      if (!controller.signal.aborted) setNews(items);
    });
    void getPopularPosts(5, controller.signal).then((posts) => {
      if (!controller.signal.aborted) {
        setRecommendations(posts.map((post) => ({
          id: String(post.postId),
          title: post.title,
          cover: post.photo ?? post.animes[0]?.imgMedium,
          hearts: post.likes,
        })));
      }
    });

    return () => controller.abort();
  }, []);

  return (
    <div className={styles.page}>
      <style>{`
        @keyframes leaderboard-title { from { opacity: 0; letter-spacing: .18em; transform: translateY(12px); } to { opacity: 1; letter-spacing: 0; transform: translateY(0); } }
        .leaderboard-title { animation: leaderboard-title .7s ease-out both; }
      `}</style>
      <CloudFooterBackground />
      <aside className={styles.side}>
        <AnimeNewsCard items={news} />
      </aside>

      <main className={styles.main}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Hall of reputation</p>
          <h1 className={styles.title}>Rekko Leaderboard</h1>
          <p className={styles.subtitle}>Compete for the cloud podium by earning reputation from the community.</p>
          <LeaderboardPodium users={users.slice(0, 3)} />
          <LeaderboardList users={users.slice(3)} />
        </section>
      </main>

      <aside className={styles.side}>
        <PopularRecommendationsCard items={recommendations} />
      </aside>
    </div>
  );
}
