import { Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PostDetailData } from '@/lib/postService';

interface Props {
  post: PostDetailData;
}

const styles = {
  card: 'group overflow-hidden rounded-[14px] border border-border bg-app-bg text-left transition duration-300 hover:-translate-y-1 hover:shadow-card',
  media: 'relative h-[150px] overflow-hidden bg-gradient-to-br from-slate-300 via-slate-500 to-slate-800',
  image: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
  mediaShade: 'absolute inset-0 bg-gradient-to-t from-black/45 to-transparent',
  body: 'p-4',
  author: 'mb-3 flex items-center gap-2',
  avatar: 'h-9 w-9 rounded-full border border-white bg-gradient-to-br from-slate-300 to-slate-700 object-cover shadow-sm',
  authorText: 'min-w-0',
  username: 'block truncate text-sm font-black text-text-main hover:text-primary',
  handle: 'block truncate text-[11px] text-text-muted',
  title: 'line-clamp-2 text-[16px] font-black leading-tight text-text-main group-hover:text-primary',
  text: 'mt-2 line-clamp-3 text-sm leading-snug text-text-muted',
  meta: 'mt-4 flex items-center gap-4 text-xs font-bold text-text-muted',
  stat: 'flex items-center gap-1.5',
  heart: 'text-primary',
};

export default function ExplorePostPreviewCard({ post }: Props) {
  const username = post.user?.username ?? 'Deleted user';
  const description = post.description?.trim();

  return (
    <article className={styles.card}>
      <Link to={`/post/${post.postId}`} className="block" aria-label={`Open post ${post.title}`}>
        <div className={styles.media}>
          {post.photo ? <img src={post.photo} alt="" className={styles.image} /> : null}
          <div className={styles.mediaShade} aria-hidden="true" />
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.author}>
          <Link to={post.user?.username ? `/profile/${post.user.username}` : '#'}>
            {post.user?.profileImage ? (
              <img src={post.user.profileImage} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatar} />
            )}
          </Link>
          <div className={styles.authorText}>
            <Link to={post.user?.username ? `/profile/${post.user.username}` : '#'} className={styles.username}>
              {username}
            </Link>
            <span className={styles.handle}>@{username}</span>
          </div>
        </div>

        <Link to={`/post/${post.postId}`}>
          <h4 className={styles.title}>{post.title}</h4>
          {description ? <p className={styles.text}>{description}</p> : null}
        </Link>

        <div className={styles.meta}>
          <span className={`${styles.stat} ${styles.heart}`}>
            <Heart size={15} fill="currentColor" /> {post.likes}
          </span>
          <span className={styles.stat}>
            <MessageCircle size={15} /> {post.commentCount ?? 0}
          </span>
        </div>
      </div>
    </article>
  );
}
