import {
  FormEvent,
  UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createComment,
  getCommentsByPostId,
  getPostById,
  getPopularPosts,
  likeComment,
  likePost,
  unlikeComment,
  unlikePost,
  type CommentData,
  type PostDetailData,
} from "@/lib/postService";
import { setWatchState } from "@/lib/animeService";
import { extractApiError } from "@/lib/apiErrors";
import { useAuthStore } from "@/store/useAuthStore";
import { getLatestAnimeNews, type AnimeNewsItem } from "@/lib/animeNewsService";
import type { RecommendationItem } from "@/components/ui/feed/PopularRecommendationsCard";
import PostDetailArticle from "@/components/ui/post-detail/PostDetailArticle";
import CommentComposer from "@/components/ui/post-detail/CommentComposer";
import CommentsVirtualList from "@/components/ui/post-detail/CommentsVirtualList";
import PostDetailSidebar from "@/components/ui/post-detail/PostDetailSidebar";

const COMMENTS_LIMIT = 30;
const COMMENT_ROW_HEIGHT = 112;
const COMMENT_OVERSCAN = 6;

const styles = {
  page: "min-h-full bg-app-bg font-gabarito",
  shell:
    "mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-4 min-h-[calc(100vh-136px)] xl:grid-cols-[260px_minmax(0,920px)_260px] xl:px-[4%]",
  main: "min-w-0 border-x border-border bg-app-bg",
  state: "px-6 py-8 text-center text-text-muted",
  error: "px-6 py-8 text-center text-status-red",
  backTop:
    "fixed right-[10%] bottom-12 z-40 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-card hover:bg-primary-dark transition-colors",
};

function normalizeRelated(post: PostDetailData) {
  return post.animes.map((anime) => ({
    id: String(anime.malId),
    title: anime.name,
    cover: anime.imgMedium || anime.imgLarge || "",
  }));
}

export default function PostDetail() {
  const { postId: postIdParam } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const isAuthenticated = Boolean(currentUser);
  const postId = postIdParam ? Number(postIdParam) : NaN;

  const [post, setPost] = useState<PostDetailData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);
  const [news, setNews] = useState<AnimeNewsItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const likingPostRef = useRef(false);
  const likingCommentsRef = useRef(new Set<number>());

  useEffect(() => {
    function handleWindowScroll() {
      setShowBackTop(
        window.scrollY > 240 || (viewportRef.current?.scrollTop ?? 0) > 240,
      );
    }

    handleWindowScroll();
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  useEffect(() => {
    if (!Number.isFinite(postId)) {
      setError("Invalid post ID");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getPostById(postId, { page: 1, limit: COMMENTS_LIMIT }, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setPost(data.post);
        setComments(data.comments.comments);
        setCommentsTotal(data.comments.pagination.total);
        setPage(data.comments.pagination.page);
        setPages(data.comments.pagination.pages);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(extractApiError(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, [postId]);

  useEffect(() => {
    const controller = new AbortController();
    const malIds = post?.animes.map((anime) => anime.malId) ?? [52991, 5114, 9253, 30276];
    void getLatestAnimeNews(malIds, 7, controller.signal).then((items) => {
      if (!controller.signal.aborted) setNews(items);
    }).catch(() => {
      if (!controller.signal.aborted) setNews([]);
    });
    void getPopularPosts(5, controller.signal).then((posts) => {
      if (controller.signal.aborted) return;
      setRecommendations(posts.map((item) => ({
        id: String(item.postId),
        title: item.title,
        cover: item.photo ?? item.animes[0]?.imgMedium,
        hearts: item.likes,
      })));
    }).catch(() => {
      if (!controller.signal.aborted) setRecommendations([]);
    });

    return () => controller.abort();
  }, [post?.postId]);

  async function loadMoreComments() {
    if (loadingMore || page >= pages || !Number.isFinite(postId)) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const data = await getCommentsByPostId(postId, {
        page: nextPage,
        limit: COMMENTS_LIMIT,
      });
      setComments((prev) => [...prev, ...data.comments]);
      setCommentsTotal(data.pagination.total);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setLoadingMore(false);
    }
  }

  function handleCommentsScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    setScrollTop(element.scrollTop);
    setShowBackTop(window.scrollY > 240 || element.scrollTop > 240);

    if (element.scrollHeight - element.scrollTop - element.clientHeight < 420) {
      void loadMoreComments();
    }
  }

  async function handleSubmitComment(event: FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !Number.isFinite(postId)) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      await createComment({ postId, message: trimmed });
      setMessage("");
      const data = await getCommentsByPostId(postId, {
        page: 1,
        limit: COMMENTS_LIMIT,
      });
      setComments(data.comments);
      setCommentsTotal(data.pagination.total);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePostLike() {
    if (!post) return;
    if (likingPostRef.current) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    likingPostRef.current = true;
    const previous = post;
    setPost({
      ...post,
      hasLiked: !post.hasLiked,
      likes: post.hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
    });

    try {
      const updated = post.hasLiked
        ? await unlikePost(post.postId)
        : await likePost(post.postId);
      if (updated) setPost(updated);
    } catch (err: unknown) {
      setPost(previous);
      setError(extractApiError(err));
    } finally {
      likingPostRef.current = false;
    }
  }

  async function handleCommentLike(commentId: number) {
    if (likingCommentsRef.current.has(commentId)) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const current = comments.find((comment) => comment.commentId === commentId);
    if (!current) return;

    likingCommentsRef.current.add(commentId);
    const optimistic = {
      ...current,
      hasLiked: !current.hasLiked,
      likes: current.hasLiked ? Math.max(0, current.likes - 1) : current.likes + 1,
    };
    setComments((prev) =>
      prev.map((comment) => (comment.commentId === commentId ? optimistic : comment)),
    );

    try {
      const updated = current.hasLiked
        ? await unlikeComment(commentId)
        : await likeComment(commentId);
      if (updated) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.commentId === commentId
              ? {
                  ...comment,
                  likes: updated.likes ?? optimistic.likes,
                  hasLiked: optimistic.hasLiked,
                }
              : comment,
          ),
        );
      }
    } catch (err: unknown) {
      setComments((prev) =>
        prev.map((comment) => (comment.commentId === commentId ? current : comment)),
      );
      setError(extractApiError(err));
    } finally {
      likingCommentsRef.current.delete(commentId);
    }
  }

  async function handleSharePost() {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy post link", url);
    }
  }

  const virtual = useMemo(() => {
    const viewportHeight = viewportRef.current?.clientHeight ?? 620;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / COMMENT_ROW_HEIGHT) - COMMENT_OVERSCAN,
    );
    const visibleCount =
      Math.ceil(viewportHeight / COMMENT_ROW_HEIGHT) + COMMENT_OVERSCAN * 2;
    const endIndex = Math.min(comments.length, startIndex + visibleCount);
    return comments.slice(startIndex, endIndex).map((comment, index) => ({
      comment,
      index: startIndex + index,
    }));
  }, [comments, scrollTop]);

  if (loading) return <p className={styles.state}>Loading post...</p>;
  if (error && !post) return <p className={styles.error}>{error}</p>;
  if (!post) return <p className={styles.state}>Post not found.</p>;

  const relatedAnimes = normalizeRelated(post);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <PostDetailSidebar side="left" news={news} />
        <main className={styles.main}>
          <PostDetailArticle
            post={post}
            commentsTotal={commentsTotal}
            relatedAnimes={relatedAnimes}
            isAuthenticated={isAuthenticated}
            onLike={handlePostLike}
            onShare={handleSharePost}
            onAddAnime={(anime) => {
              const malId = Number(anime.id);
              if (Number.isFinite(malId)) void setWatchState(malId, "PLAN_TO_WATCH");
            }}
            onAnimeClick={(anime) => navigate(`/animes/${anime.id}`)}
          />

          <CommentComposer
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
            message={message}
            submitting={submitting}
            onMessageChange={setMessage}
            onSubmit={handleSubmitComment}
          />

          <CommentsVirtualList
            comments={comments}
            virtualComments={virtual}
            rowHeight={COMMENT_ROW_HEIGHT}
            loadingMore={loadingMore}
            error={error}
            viewportRef={viewportRef}
            onScroll={handleCommentsScroll}
            onLike={handleCommentLike}
          />
        </main>

        <PostDetailSidebar side="right" recommendations={recommendations} />
        {showBackTop && (
          <button
            type="button"
            className={styles.backTop}
            aria-label="Back to top"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <ArrowUp size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
