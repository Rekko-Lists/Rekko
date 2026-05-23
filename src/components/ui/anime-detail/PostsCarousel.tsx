import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/common/Avatar';
import type { AnimePost } from '@/types/anime';

interface Props {
  posts: AnimePost[];
  loading?: boolean;
  malId: number;
}

const styles = {
  section:     'flex flex-col font-gabarito',
  header:      'flex items-center justify-between mb-2',
  label:       'text-[20px] text-text-main leading-none',
  viewBtn:     'flex flex-col items-center justify-center w-[51px] h-[68px] bg-border-light rounded-btn text-[#788397] hover:bg-border transition-colors',
  viewBtnPlus: 'text-[20px] leading-none',
  viewBtnText: 'text-[13px] leading-none mt-0.5',
  body:        'relative flex items-center gap-2',
  navBtn:      'flex-shrink-0 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:bg-app-bg transition-colors disabled:opacity-30',
  track:       'flex-1 overflow-hidden',
  trackMask:   'flex gap-3 items-stretch transition-transform duration-300 ease-out',
  postCard:    'flex-shrink-0 w-[280px] h-[184px] bg-surface border border-border rounded-card p-3 flex flex-col gap-1.5 cursor-pointer hover:shadow-md transition-shadow',
  postPeek:    'flex-shrink-0 w-[128px] h-[184px] bg-surface border border-border rounded-card opacity-60',
  postHeader:  'flex items-center gap-2',
  postUser:    'text-[10px] font-medium text-text-main flex-1 truncate',
  postTime:    'text-[10px] text-text-muted',
  postMenu:    'text-text-muted text-sm leading-none px-1',
  postDivider: 'h-px bg-border',
  postBody:    'text-[11px] text-text-main leading-snug line-clamp-4 flex-1',
  postFooter:  'flex items-center gap-3 text-[10px] text-text-muted',
  empty:       'text-text-muted text-sm py-8 text-center',
  divider:     'h-px bg-border my-3',
  fadeMask:    '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
};

export default function PostsCarousel({ posts, loading, malId }: Props) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const handleViewAll = () => navigate(`/animes/${malId}/posts`);

  const handlePrev = () => {
    if (posts.length === 0) return;
    setIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const handleNext = () => {
    if (posts.length === 0) return;
    setIndex((prev) => (prev + 1) % posts.length);
  };

  return (
    <section className={styles.section} aria-label="Recommendations">
      <div className={styles.header}>
        <h2 className={styles.label}>Recommendations:</h2>
        <button type="button" className={styles.viewBtn} onClick={handleViewAll} title="View all posts">
          <Plus size={20} strokeWidth={1.5} />
          <span className={styles.viewBtnText}>View</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className={styles.empty}>No posts yet for this anime.</div>
      ) : (
        <div className={styles.body}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrev}
            aria-label="Previous post"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={`${styles.track} ${styles.fadeMask}`}>
            <div
              className={styles.trackMask}
              style={{
                // Center the active post (280) with peek cards (128) and gap (12) on each side
                transform: `translateX(calc(50% - 140px - ${index * (280 + 12)}px))`,
              }}
            >
              {posts.map((post) => (
                <PostMini key={post.id} post={post} />
              ))}
            </div>
          </div>

          <button
            type="button"
            className={styles.navBtn}
            onClick={handleNext}
            aria-label="Next post"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className={styles.divider} />
    </section>
  );
}

function PostMini({ post }: { post: AnimePost }) {
  return (
    <article className={styles.postCard}>
      <header className={styles.postHeader}>
        <Avatar src={post.avatar} username={post.user} size="sm" />
        <span className={styles.postUser}>{post.user}</span>
        <span className={styles.postTime}>{post.time}</span>
        <span className={styles.postMenu}>···</span>
      </header>
      <div className={styles.postDivider} />
      <p className={styles.postBody}>{post.text}</p>
      <footer className={styles.postFooter}>
        <span>♥ {post.likes}</span>
        <span>💬 {post.comments}</span>
      </footer>
    </article>
  );
}
