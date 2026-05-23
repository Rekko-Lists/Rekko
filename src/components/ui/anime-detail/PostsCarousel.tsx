import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/common/Avatar';
import type { AnimePost } from '@/types/anime';

interface Props {
  posts: AnimePost[];
  loading?: boolean;
  malId: number;
}

// Sizes
const POST_W = 240;
const POST_H = 184;
const POST_GAP = 16;

const styles = {
  section:     'flex flex-col font-gabarito',
  header:      'flex items-baseline justify-between mb-2',
  label:       'text-[20px] text-text-main leading-none',
  viewLink:    'text-[13px] font-medium text-primary hover:text-primary-dark hover:underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0 leading-none transition-colors',
  // Body is the visible viewport. Track inside is wider via overflow + fade mask
  // so that siblings peek through on both sides.
  body:        'relative h-[200px]',
  viewport:    'absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]',
  track:       'absolute top-1/2 left-1/2 -translate-y-1/2 flex gap-4 items-stretch transition-transform duration-300 ease-out',
  navBtn:      'absolute top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:bg-app-bg transition-colors disabled:opacity-30',
  navLeft:     'left-0',
  navRight:    'right-0',
  postCard:    'flex-shrink-0 bg-surface border border-border rounded-card p-3 flex flex-col gap-1.5 cursor-pointer hover:shadow-md transition-shadow',
  postHeader:  'flex items-center gap-2',
  postUser:    'text-[10px] font-medium text-text-main flex-1 truncate',
  postTime:    'text-[10px] text-text-muted',
  postMenu:    'text-text-muted text-sm leading-none px-1',
  postDivider: 'h-px bg-border',
  postBody:    'text-[11px] text-text-main leading-snug line-clamp-4 flex-1',
  postFooter:  'flex items-center gap-3 text-[10px] text-text-muted',
  emptyCard:   'flex-shrink-0 bg-surface border border-dashed border-border rounded-card flex items-center justify-center text-text-muted text-[12px] text-center px-4',
  divider:     'h-px bg-border my-3',
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
        <button type="button" className={styles.viewLink} onClick={handleViewAll}>
          Show more
        </button>
      </div>

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
                {loading ? 'Loading posts…' : 'No posts yet for this anime.'}
              </div>
            </div>
          ) : (
            <div
              className={styles.track}
              style={{
                // Center the active post: its left edge sits at the center of
                // the viewport minus half its width, then we shift by `index`
                // slots (card width + gap) to bring the active one to center.
                transform: `translate(calc(-${POST_W / 2}px - ${index * (POST_W + POST_GAP)}px), -50%)`,
              }}
            >
              {posts.map((post) => (
                <PostMini key={post.id} post={post} />
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

      <div className={styles.divider} />
    </section>
  );
}

function PostMini({ post }: { post: AnimePost }) {
  return (
    <article
      className={styles.postCard}
      style={{ width: POST_W, height: POST_H }}
    >
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
