import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "@/store/useFeedStore";
import Avatar from "@/components/ui/common/Avatar";
import AnimeCovers from "@/components/ui/anime/AnimeCovers";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  post: Post;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
  fallbackRelatedAnimes?: Post["relatedAnimes"];
}

const styles = {
  card: "bg-surface border-[1.5px] border-border rounded-card font-gabarito",
  header: "flex items-center gap-3 px-4 py-3",
  meta: "flex flex-col flex-1 min-w-0",
  username: "text-sm font-normal text-text-main truncate",
  time: "text-xs text-text-muted",
  menu: "text-text-muted text-lg cursor-pointer select-none leading-none px-1",
  menuWrap: "relative",
  menuPanel: "absolute right-0 top-7 z-20 w-28 rounded-card border border-border bg-surface p-1 shadow-card",
  menuItem: "w-full rounded-btn px-3 py-2 text-left text-xs text-text-main hover:bg-border-light",
  menuItemDanger: "w-full rounded-btn px-3 py-2 text-left text-xs text-status-red hover:bg-border-light",
  divider: "h-px bg-border mx-0",
  body: "px-4 py-3 text-sm text-text-main leading-relaxed",
  media: "px-4 py-4 flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-6",
  relatedCol: "w-full max-w-[360px] flex-shrink-0 flex flex-col gap-2 md:min-w-[290px]",
  relatedHead: "flex items-baseline gap-2",
  relLabel: "text-xs text-text-muted",
  bigImage:
    "w-full max-h-[250px] overflow-hidden rounded-card bg-gradient-to-br from-slate-400 to-slate-700 cursor-zoom-in md:ml-auto md:max-w-[440px]",
  bigImg: "block max-h-[250px] w-full object-contain",
  actions: "flex items-center gap-5 px-4 py-2.5 border-t border-border",
  actionBtn:
    "flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer hover:text-primary transition-colors",
  lightbox: "fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6",
  lightboxImage: "max-h-full max-w-full rounded-card object-contain shadow-card",
};

export default function PostCard({
  post,
  onLike,
  onDelete,
  fallbackRelatedAnimes = [],
}: Props) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = Boolean(currentUser && post.user === currentUser.username);

  const relatedAnimes =
    post.relatedAnimes.length > 0 ? post.relatedAnimes : fallbackRelatedAnimes;
  const visibleAnimes = relatedAnimes.slice(0, 5);

  const handleAnimeClick = (anime: { id: string | number }) => {
    if (!Number.isFinite(Number(anime.id))) return;
    navigate(`/animes/${anime.id}`);
  };
  const handlePostClick = () => {
    if (!Number.isFinite(Number(post.id))) return;
    navigate(`/post/${post.id}`);
  };
  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy post link", url);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Avatar src={post.avatar} username={post.user} size="sm" />
        <div className={styles.meta}>
          <button
            type="button"
            className={`${styles.username} text-left hover:text-primary`}
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/profile/${post.user}`);
            }}
          >
            {post.user}
          </button>
          <span className={styles.time}>{post.time}</span>
        </div>
        <div className={styles.menuWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.menu}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Post options"
          >
            ···
          </button>
          {menuOpen && (
            <div className={styles.menuPanel}>
              {isOwner ? (
                <button
                  type="button"
                  className={styles.menuItemDanger}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(post.id);
                  }}
                >
                  Delete
                </button>
              ) : (
                <button type="button" className={styles.menuItem}>
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      <p className={styles.body}>{post.text}</p>

      <div className={styles.divider} />

      <div className={styles.media}>
        {visibleAnimes.length > 0 && (
          <div
            className={styles.relatedCol}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.relatedHead}>
              <span className={styles.relLabel}>Related to:</span>
            </div>
            <AnimeCovers
              animes={visibleAnimes}
              showAddBtn={false}
              className="flex-wrap"
              onAnimeClick={handleAnimeClick}
            />
          </div>
        )}
        {post.userImage && (
          <button
            type="button"
            className={styles.bigImage}
            onClick={() => setImageOpen(true)}
            aria-label="Open post image"
          >
            <img src={post.userImage} alt="" className={styles.bigImg} />
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${post.liked ? "text-primary" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onLike?.(post.id);
          }}
        >
          <Heart size={15} fill={post.liked ? "#FF9E00" : "none"} />
          <span>{post.likes}</span>
        </button>
        <button
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            handlePostClick();
          }}
        >
          <MessageCircle size={15} />
          <span>{post.comments}</span>
        </button>
        <button
          className={styles.actionBtn}
          onClick={handleShare}
        >
          <Share2 size={15} />
        </button>
      </div>
      {imageOpen && post.userImage && (
        <button
          type="button"
          className={styles.lightbox}
          onClick={() => setImageOpen(false)}
          aria-label="Close image"
        >
          <img src={post.userImage} alt="" className={styles.lightboxImage} />
        </button>
      )}
    </div>
  );
}
