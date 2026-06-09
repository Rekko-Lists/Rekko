import { Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "@/components/ui/common/Avatar";
import AnimeCovers from "@/components/ui/anime/AnimeCovers";
import { formatPostTime, type PostDetailData } from "@/lib/postService";

interface Props {
  post: PostDetailData;
  commentsTotal: number;
  relatedAnimes: { id: string; title: string; cover: string }[];
  isAuthenticated: boolean;
  isOwner: boolean;
  onLike: () => void;
  onShare: () => void;
  onDelete: () => void;
  onAnimeClick: (anime: { id: string | number }) => void;
}

const styles = {
  postHeader: "flex items-center gap-3 px-6 py-4 border-b border-border",
  meta: "flex flex-col flex-1 min-w-0",
  username: "text-sm text-text-main truncate hover:text-primary",
  time: "text-xs text-text-muted",
  menuWrap: "relative",
  menuBtn: "text-text-muted px-2 cursor-pointer select-none",
  menuPanel: "absolute right-0 top-7 z-20 w-28 rounded-card border border-border bg-surface p-1 shadow-card",
  menuItemDanger: "w-full rounded-btn px-3 py-2 text-left text-xs text-status-red hover:bg-border-light flex items-center gap-1.5",
  postBody: "px-6 py-5 border-b border-border",
  title: "text-[18px] text-text-main font-semibold mb-2",
  text: "text-sm text-text-main leading-relaxed max-w-[980px]",
  media: "mt-8 flex flex-col items-start gap-6 md:flex-row md:justify-between md:gap-8",
  related: "w-full max-w-[420px] flex flex-col gap-2 md:min-w-[260px]",
  relLabel: "text-sm text-text-main",
  photoWrap:
    "w-full max-w-[460px] max-h-[290px] rounded-card overflow-hidden bg-gradient-to-br from-slate-500 to-slate-800 md:ml-auto",
  photo: "block max-h-[290px] w-full object-contain",
  actions: "mt-4 flex items-center gap-4 text-sm text-text-secondary",
  actionBtn: "flex items-center gap-1.5 hover:text-primary transition-colors",
};

export default function PostDetailArticle({
  post,
  commentsTotal,
  relatedAnimes,
  isOwner,
  onLike,
  onShare,
  onDelete,
  onAnimeClick,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <article>
      <header className={styles.postHeader}>
        <Avatar src={post.user?.profileImage} username={post.user?.username ?? "Unknown"} size="sm" />
        <div className={styles.meta}>
          <Link to={post.user?.username ? `/profile/${post.user.username}` : "#"} className={styles.username}>
            {post.user?.username ?? "Deleted user"}
          </Link>
          <span className={styles.time}>{formatPostTime(post.createdAt)}</span>
        </div>
        {isOwner && (
          <div className={styles.menuWrap} ref={menuRef}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Post options"
            >
              ···
            </button>
            {menuOpen && (
              <div className={styles.menuPanel}>
                <button
                  type="button"
                  className={styles.menuItemDanger}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className={styles.postBody}>
        <h1 className={styles.title}>{post.title}</h1>
        {post.description && <p className={styles.text}>{post.description}</p>}

        <div className={styles.media}>
          {relatedAnimes.length > 0 && (
            <div className={styles.related}>
              <span className={styles.relLabel}>Related to:</span>
              <AnimeCovers
                animes={relatedAnimes.slice(0, 5)}
                showAddBtn={false}
                className="flex-wrap"
                onAnimeClick={onAnimeClick}
              />
            </div>
          )}
          {post.photo && (
            <div className={styles.photoWrap}>
              <img src={post.photo} alt="" className={styles.photo} />
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={`${styles.actionBtn} ${post.hasLiked ? "text-primary" : ""}`} onClick={onLike}>
            <Heart size={16} fill={post.hasLiked ? "currentColor" : "none"} />
            <span>{post.likes}</span>
          </button>
          <span className={styles.actionBtn}>
            <MessageCircle size={16} />
            <span>{commentsTotal}</span>
          </span>
          <button type="button" className={styles.actionBtn} onClick={onShare}>
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
