import { ChevronLeft, ChevronRight, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/ui/common/Avatar";
import AnimeCovers from "@/components/ui/anime/AnimeCovers";
import type { AnimePost } from "@/types/anime";

interface Props {
  posts: AnimePost[];
  loading?: boolean;
  malId: number;
  showHeader?: boolean;
  currentAnime?: {
    id: string | number;
    title: string;
    cover?: string;
  };
}

// Sizes
const POST_W = 320;
const POST_H = 213;
const POST_GAP = 16;

const styles = {
  section: "flex h-full flex-col font-gabarito",
  header: "flex items-baseline justify-between mb-2",
  label: "text-[20px] text-text-main leading-none",
  viewLink:
    "text-[13px] font-medium text-primary hover:text-primary-dark hover:underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0 leading-none transition-colors",
  body: "relative min-h-[232px] flex-1",
  viewport:
    "absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
  track:
    "absolute top-1/2 left-1/2 -translate-y-1/2 flex gap-4 items-stretch transition-transform ease-out",
  navBtn:
    "absolute top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:bg-app-bg transition-colors disabled:opacity-30",
  navLeft: "left-0",
  navRight: "right-0",
  postCard:
    "flex-shrink-0 bg-surface border border-border rounded-card p-3 flex flex-col gap-1.5 cursor-pointer hover:shadow-md transition-shadow",
  postHeader: "flex items-center gap-2",
  postUser: "text-[10px] font-medium text-text-main flex-1 truncate",
  postTime: "text-[10px] text-text-muted",
  postMenu: "text-text-muted text-sm leading-none px-1",
  postDivider: "h-px bg-border",
  postBody: "text-[11px] text-text-main leading-snug line-clamp-2",
  related: "flex flex-col gap-1.5",
  relatedLabel: "text-[10px] text-text-muted leading-none",
  relatedViewport:
    "w-[146px] overflow-hidden [mask-image:linear-gradient(to_right,black_0%,black_84%,transparent_100%)]",
  postFooter: "flex items-center gap-3 text-[10px] text-text-muted",
  emptyCard:
    "flex-shrink-0 bg-surface border border-dashed border-border rounded-card flex items-center justify-center text-text-muted text-[12px] text-center px-4",
};

export default function PostsCarousel({
  posts,
  loading,
  malId,
  showHeader = true,
  currentAnime,
}: Props) {
  const [visualIndex, setVisualIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setVisualIndex(posts.length > 1 ? 1 : 0);
    setWithTransition(false);
  }, [posts.length]);

  useEffect(() => {
    if (!withTransition) {
      const frame = requestAnimationFrame(() => setWithTransition(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [withTransition]);

  const carouselPosts =
    posts.length > 1 ? [posts[posts.length - 1], ...posts, posts[0]] : posts;

  const handleViewAll = () => navigate(`/animes/${malId}/posts`);

  const handlePrev = () => {
    if (posts.length === 0) return;
    setWithTransition(true);
    setVisualIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (posts.length === 0) return;
    setWithTransition(true);
    setVisualIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (posts.length <= 1) return;

    if (visualIndex === 0) {
      setWithTransition(false);
      setVisualIndex(posts.length);
    } else if (visualIndex === posts.length + 1) {
      setWithTransition(false);
      setVisualIndex(1);
    }
  };

  return (
    <section className={styles.section} aria-label="Recommendations">
      {showHeader && (
        <div className={styles.header}>
          <h2 className={styles.label}>Recommendations:</h2>
          <button
            type="button"
            className={styles.viewLink}
            onClick={handleViewAll}
          >
            Show more
          </button>
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.viewport}>
          {loading || posts.length === 0 ? (
            <div
              className={styles.track}
              style={{
                width: POST_W,
                transform: `translate(-50%, -50%)`,
              }}
            >
              <div
                className={styles.emptyCard}
                style={{ width: POST_W, height: POST_H }}
              >
                {loading ? "Loading posts…" : "No posts yet for this anime."}
              </div>
            </div>
          ) : (
            <div
              className={styles.track}
              style={{
                transform: `translate(calc(-${POST_W / 2}px - ${visualIndex * (POST_W + POST_GAP)}px), -50%)`,
                transitionDuration: withTransition ? "300ms" : "0ms",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {carouselPosts.map((post, postIndex) => (
                <PostMini
                  key={`${post.id || "post"}-${postIndex}`}
                  post={post}
                  malId={malId}
                  currentAnime={currentAnime}
                  onAnimeClick={(animeId) => navigate(`/animes/${animeId}`)}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.navBtn} ${styles.navLeft}`}
          onClick={handlePrev}
          aria-label="Previous post"
          disabled={posts.length === 0}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navRight}`}
          onClick={handleNext}
          aria-label="Next post"
          disabled={posts.length === 0}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

function getPreviewAnimes(
  post: AnimePost,
  malId: number,
  currentAnime?: { id: string | number; title: string; cover?: string },
) {
  const currentMalId = String(malId);
  const related = post.relatedAnimes ?? [];
  const current =
    related.find((anime) => String(anime.id) === currentMalId) ?? currentAnime;
  const rest = related.filter((anime) => String(anime.id) !== currentMalId);
  const ordered = current ? [current, ...rest] : rest;

  return ordered.slice(0, ordered.length > 3 ? 4 : 3);
}

function PostMini({
  post,
  malId,
  currentAnime,
  onAnimeClick,
}: {
  post: AnimePost;
  malId: number;
  currentAnime?: { id: string | number; title: string; cover?: string };
  onAnimeClick: (animeId: string | number) => void;
}) {
  const navigate = useNavigate();
  const previewAnimes = getPreviewAnimes(post, malId, currentAnime);

  return (
    <article
      className={styles.postCard}
      style={{ width: POST_W, height: POST_H }}
      onClick={() => {
        if (post.id && Number.isFinite(Number(post.id))) {
          navigate(`/post/${post.id}`);
        }
      }}
    >
      <header className={styles.postHeader} onClick={(e) => e.stopPropagation()}>
        <Avatar src={post.avatar} username={post.user} size="sm" />
        <span className={styles.postUser}>{post.user}</span>
        <span className={styles.postTime}>{post.time}</span>
      </header>
      <div className={styles.postDivider} />
      <p className={styles.postBody}>{post.text}</p>
      {previewAnimes.length > 0 && (
        <div className={styles.related} onClick={(e) => e.stopPropagation()}>
          <span className={styles.relatedLabel}>Related to:</span>
          <div className={styles.relatedViewport}>
            <AnimeCovers
              animes={previewAnimes}
              showAddBtn={false}
              variant="mini"
              onAnimeClick={(anime) => {
                if (!Number.isFinite(Number(anime.id))) return;
                onAnimeClick(anime.id);
              }}
            />
          </div>
        </div>
      )}
      <footer className={styles.postFooter}>
        <span className="flex items-center gap-1"><Heart size={10} /> {post.likes}</span>
        <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.comments}</span>
      </footer>
    </article>
  );
}
