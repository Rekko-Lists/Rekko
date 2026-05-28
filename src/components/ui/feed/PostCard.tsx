import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/store/useFeedStore';
import Avatar from '@/components/ui/common/Avatar';
import AnimeCovers from '@/components/ui/anime/AnimeCovers';
import { setWatchState } from '@/lib/animeService';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
  post: Post;
  onLike?: (id: string) => void;
  fallbackRelatedAnimes?: Post['relatedAnimes'];
}

const styles = {
  card:       'bg-surface border-[1.5px] border-border rounded-card font-gabarito',
  header:     'flex items-center gap-3 px-4 py-3',
  meta:       'flex flex-col flex-1 min-w-0',
  username:   'text-sm font-normal text-text-main truncate',
  time:       'text-xs text-text-muted',
  menu:       'text-text-muted text-lg cursor-pointer select-none leading-none px-1',
  divider:    'h-px bg-border mx-0',
  body:       'px-4 py-3 text-sm text-text-main leading-relaxed',
  media:      'px-4 py-4 flex items-start justify-between gap-6',
  relatedCol: 'min-w-[290px] max-w-[360px] flex-shrink-0 flex flex-col gap-2',
  relatedHead: 'flex items-baseline gap-2',
  relLabel:   'text-xs text-text-muted',
  bigImage:   'ml-auto max-w-[440px] max-h-[250px] overflow-hidden rounded-card bg-gradient-to-br from-slate-400 to-slate-700',
  bigImg:     'block max-h-[250px] w-full object-contain',
  actions:    'flex items-center gap-5 px-4 py-2.5 border-t border-border',
  actionBtn:  'flex items-center gap-1.5 text-sm text-text-secondary cursor-pointer hover:text-primary transition-colors',
};

export default function PostCard({ post, onLike, fallbackRelatedAnimes = [] }: Props) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => Boolean(s.user));
  const relatedAnimes = post.relatedAnimes.length > 0 ? post.relatedAnimes : fallbackRelatedAnimes;
  const visibleAnimes = relatedAnimes.slice(0, 5);
  const handleAddAnime = (anime: { id: string | number }) => {
    if (!isAuthenticated) return;
    const malId = Number(anime.id);
    if (!Number.isFinite(malId)) return;
    void setWatchState(malId, 'PLAN_TO_WATCH');
  };
  const handleAnimeClick = (anime: { id: string | number }) => {
    if (!Number.isFinite(Number(anime.id))) return;
    navigate(`/animes/${anime.id}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Avatar src={post.avatar} username={post.user} size="sm" />
        <div className={styles.meta}>
          <span className={styles.username}>{post.user}</span>
          <span className={styles.time}>{post.time}</span>
        </div>
        <span className={styles.menu}>···</span>
      </div>

      <div className={styles.divider} />

      <p className={styles.body}>{post.text}</p>

      <div className={styles.divider} />

      <div className={styles.media}>
        {visibleAnimes.length > 0 && (
          <div className={styles.relatedCol}>
            <div className={styles.relatedHead}>
              <span className={styles.relLabel}>Related to:</span>
            </div>
            <AnimeCovers
              animes={visibleAnimes}
              showAddBtn={isAuthenticated}
              className="flex-wrap"
              onAddAnime={handleAddAnime}
              onAnimeClick={handleAnimeClick}
            />
          </div>
        )}
        {post.userImage && (
          <div className={styles.bigImage}>
            <img src={post.userImage} alt="" className={styles.bigImg} />
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${post.liked ? 'text-primary' : ''}`} onClick={() => onLike?.(post.id)}>
          <Heart size={15} fill={post.liked ? '#FF9E00' : 'none'} />
          <span>{post.likes}</span>
        </button>
        <button className={styles.actionBtn}>
          <MessageCircle size={15} />
          <span>{post.comments}</span>
        </button>
        <button className={styles.actionBtn}>
          <Share2 size={15} />
        </button>
      </div>
    </div>
  );
}
