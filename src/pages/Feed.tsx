import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "@/components/ui/feed/PostCard";
import AnimeNewsCard from "@/components/ui/feed/AnimeNewsCard";
import ReputationLeaderboard from "@/components/ui/feed/ReputationLeaderboard";
import PopularRecommendationsCard from "@/components/ui/feed/PopularRecommendationsCard";
import SiteLinks from "@/components/ui/common/SiteLinks";
import { useFeedStore } from "@/store/useFeedStore";
import type { RecommendationItem } from "@/components/ui/feed/PopularRecommendationsCard";
import type { SiteLinkItem } from "@/components/ui/common/SiteLinks";
import { useAuthStore } from "@/store/useAuthStore";
import { extractApiError } from "@/lib/apiErrors";
import { getLatestAnimeNews, type AnimeNewsItem } from "@/lib/animeNewsService";
import {
  deletePost,
  getPopularPosts,
  getPosts,
  likePost,
  toFeedPost,
  unlikePost,
} from "@/lib/postService";
import { getTopReputationUsers } from "@/lib/userService";
import AnimeListWidget from "@/components/ui/feed/widgets/AnimeListWidget";
import Seo from "@/components/seo/Seo";
import {
  itemListJsonLd,
  organizationJsonLd,
  pageJsonLd,
  websiteJsonLd,
} from "@/components/seo/jsonLd";
import { seoPages } from "@/components/seo/pages";
import {
  getAiringTodayAnimes,
  getPopularAnimes,
  getPopularUpcomingAnimes,
  getTopAiringAnimes,
  getTopSeasonalAnimes,
  getTopUpcomingAnimes,
} from "@/lib/animeService";

const FEED_LIMIT = 10;
const NEWS_FALLBACK_MAL_IDS = [52991, 5114, 9253, 30276];

const SITE_LINKS: SiteLinkItem[] = [
  {
    label: "Rules of the site",
    icon: "Book",
    href: "/rules",
  },
  {
    label: "About",
    icon: "Book",
    href: "/about",
  },
  {
    label: "FAQ",
    icon: "Question",
    href: "/faq",
  },
];

const styles = {
  page: "flex flex-col px-4 font-gabarito min-h-full items-stretch lg:flex-row lg:items-start lg:px-[6%]",
  sidebar: "flex w-full flex-col gap-4 py-4 lg:sticky lg:top-[136px] lg:max-h-[calc(100vh-148px)] lg:w-[231px] lg:flex-shrink-0 lg:overflow-y-auto lg:py-6",
  center: "flex-1 flex flex-col gap-4 min-w-0 py-6",
  divider: "hidden w-[1.5px] bg-black/15 self-stretch mx-5 lg:block",
  state: "rounded-card border border-border bg-surface px-4 py-6 text-center text-sm text-text-muted",
  error: "rounded-card border border-status-red/30 bg-surface px-4 py-6 text-center text-sm text-status-red",
};

export default function Feed() {
  const navigate = useNavigate();
  const posts = useFeedStore((s) => s.posts);
  const loading = useFeedStore((s) => s.loading);
  const hasMore = useFeedStore((s) => s.hasMore);
  const setPosts = useFeedStore((s) => s.setPosts);
  const appendPosts = useFeedStore((s) => s.appendPosts);
  const setLoading = useFeedStore((s) => s.setLoading);
  const setHasMore = useFeedStore((s) => s.setHasMore);
  const toggleLike = useFeedStore((s) => s.toggleLike);
  const updatePost = useFeedStore((s) => s.updatePost);
  const isAuthenticated = useAuthStore((s) => Boolean(s.user));
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<AnimeNewsItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<
    { rank: number; user: string; hearts: number; avatar?: string }[]
  >([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingPagesRef = useRef(new Set<number>());
  const likingPostsRef = useRef(new Set<string>());
  const newsMalIdsKey = useMemo(() => {
    const ids = posts.flatMap((post) => post.relatedAnimes.map((anime) => Number(anime.id)));
    return [...new Set(ids.filter(Number.isFinite))].slice(0, 4).join(",");
  }, [posts]);
  const randomWidgetLoaders = useMemo(
    () => [
      {
        key: "seasonal",
        title: "Seasonal animes",
        load: (signal?: AbortSignal) => getTopSeasonalAnimes(5, signal),
        onViewMore: () => navigate("/animes?season=current"),
      },
      {
        key: "popular",
        title: "Popular animes",
        load: (signal?: AbortSignal) => getPopularAnimes(5, signal),
      },
      {
        key: "airing-today",
        title: "Airing today",
        load: (signal?: AbortSignal) => getAiringTodayAnimes(5, signal),
        showBroadcastTime: true,
      },
      {
        key: "top-upcoming",
        title: "Top upcoming",
        load: (signal?: AbortSignal) => getTopUpcomingAnimes(5, signal),
      },
      {
        key: "popular-upcoming",
        title: "Popular upcoming",
        load: (signal?: AbortSignal) => getPopularUpcomingAnimes(5, signal),
      },
      {
        key: "top-airing",
        title: "Top airing",
        load: (signal?: AbortSignal) => getTopAiringAnimes(5, signal),
      },
    ],
    [navigate],
  );
  const randomWidgets = useMemo(() => {
    const shuffled = [...randomWidgetLoaders].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, [randomWidgetLoaders]);

  const loadPosts = useCallback(
    async (targetPage: number, signal?: AbortSignal) => {
      if (loadingPagesRef.current.has(targetPage)) return;
      loadingPagesRef.current.add(targetPage);
      setLoading(true);
      setError(null);

      try {
        const result = await getPosts(
          {
            page: targetPage,
            limit: FEED_LIMIT,
            sortField: "createdAt",
            sortOrder: "desc",
          },
          signal,
        );
        const normalized = result.posts.map(toFeedPost);

        if (targetPage === 1) setPosts(normalized);
        else appendPosts(normalized);

        setPage(result.pagination.page);
        setHasMore(result.pagination.page < result.pagination.pages);
      } catch (err: unknown) {
        if (signal?.aborted) return;
        setError(extractApiError(err));
        setHasMore(false);
      } finally {
        loadingPagesRef.current.delete(targetPage);
        if (!signal?.aborted) setLoading(false);
      }
    },
    [appendPosts, setHasMore, setLoading, setPosts],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadPosts(1, controller.signal);
    return () => {
      controller.abort();
      loadingPagesRef.current.delete(1);
    };
  }, [loadPosts]);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        void loadPosts(page + 1);
      }
    }, { rootMargin: "500px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, loadPosts, loading, page]);

  useEffect(() => {
    const controller = new AbortController();

    getTopReputationUsers(4, controller.signal)
      .then((users) => {
        if (controller.signal.aborted) return;
        setLeaderboard(
          users.map((user, index) => ({
            rank: index + 1,
            user: user.username,
            hearts: user.reputation,
            avatar: user.profileImage ?? undefined,
          })),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setLeaderboard([]);
      });

    getPopularPosts(5, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setRecommendations(
          result.map((post) => ({
            id: String(post.postId),
            title: post.title,
            cover: post.photo ?? post.animes[0]?.imgMedium,
            hearts: post.likes,
          })),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setRecommendations([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const malIds = newsMalIdsKey
      ? newsMalIdsKey.split(",").map((id) => Number(id))
      : [];
    void getLatestAnimeNews(
      malIds.length > 0 ? malIds : NEWS_FALLBACK_MAL_IDS,
      5,
      controller.signal,
    ).then((items) => {
      if (!controller.signal.aborted) setNews(items);
    }).catch(() => {
      if (!controller.signal.aborted) setNews([]);
    });

    return () => controller.abort();
  }, [newsMalIdsKey]);

  async function handleDelete(id: string) {
    const postId = Number(id);
    if (!Number.isFinite(postId)) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== id));
    } catch {
      // silently ignore
    }
  }

  async function handleLike(id: string) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (likingPostsRef.current.has(id)) return;

    const current = posts.find((post) => post.id === id);
    const postId = Number(id);
    if (!current || !Number.isFinite(postId)) return;

    likingPostsRef.current.add(id);
    toggleLike(id);

    try {
      const updated = current.liked ? await unlikePost(postId) : await likePost(postId);
      if (updated) updatePost(toFeedPost(updated));
    } catch {
      toggleLike(id);
    } finally {
      likingPostsRef.current.delete(id);
    }
  }

  return (
    <div className={styles.page}>
      <Seo
        title={seoPages.feed.title}
        description={seoPages.feed.description}
        canonicalPath={seoPages.feed.path}
        jsonLd={[
          websiteJsonLd(),
          organizationJsonLd(),
          pageJsonLd({
            type: seoPages.feed.schemaType,
            path: seoPages.feed.path,
            name: seoPages.feed.title,
            description: seoPages.feed.description,
          }),
          itemListJsonLd(
            "Latest Rekko posts",
            seoPages.feed.path,
            posts.slice(0, 10).map((post) => ({
              name: post.text.slice(0, 90) || "Rekko post",
              url: `/post/${post.id}`,
              image: post.userImage,
            })),
          ),
        ]}
      />
      <aside className={styles.sidebar}>
        <AnimeNewsCard items={news} />
        {randomWidgets[0] && (
          <AnimeListWidget {...randomWidgets[0]} />
        )}
        <SiteLinks items={SITE_LINKS} />
      </aside>

      <div className={styles.divider} />

      <main className={styles.center}>
        {error && <p className={styles.error}>{error}</p>}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
        ))}
        {loading && <p className={styles.state}>Loading posts...</p>}
        {!loading && posts.length === 0 && !error && (
          <p className={styles.state}>No posts yet.</p>
        )}
        {!error && <div ref={sentinelRef} />}
      </main>

      <div className={styles.divider} />

      <aside className={styles.sidebar}>
        <ReputationLeaderboard
          entries={leaderboard}
          onViewMore={() => navigate("/leaderboard")}
        />
        <PopularRecommendationsCard items={recommendations} />
        {randomWidgets[1] && (
          <AnimeListWidget {...randomWidgets[1]} />
        )}
      </aside>
    </div>
  );
}
