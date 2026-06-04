import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Pagination from '@/components/ui/common/Pagination';
import PostCard from '@/components/ui/feed/PostCard';
import { useAnimeDetail } from '@/hooks/useAnimeDetail';
import { useAnimePosts } from '@/hooks/useAnimePosts';
import type { Post } from '@/store/useFeedStore';
import type { AnimePost } from '@/types/anime';
import Seo from '@/components/seo/Seo';
import { itemListJsonLd, pageJsonLd } from '@/components/seo/jsonLd';

const styles = {
  page:      'min-h-full bg-app-bg font-gabarito',
  container: 'max-w-[900px] mx-auto px-6 py-8',
  header:    'flex items-center gap-3 mb-6',
  cover:     'w-[40px] h-[55px] rounded-card overflow-hidden bg-gradient-to-br from-slate-500 to-slate-800',
  title:     'text-[24px] text-text-main',
  backLink:  'mb-4 inline-block text-primary hover:underline text-sm',
  list:      'flex flex-col gap-4',
  loading:   'py-12 text-center text-text-muted',
  empty:     'py-12 text-center text-text-muted',
  error:     'py-12 text-center text-status-red',
};

function toPost(p: AnimePost): Post {
  return {
    id:            p.id,
    user:          p.user,
    avatar:        p.avatar,
    time:          p.time,
    text:          p.text,
    userImage:     p.userImage,
    likes:         p.likes,
    comments:      p.comments,
    liked:         p.liked ?? false,
    relatedAnimes: p.relatedAnimes.map((a) => ({
      id:    a.id,
      title: a.title,
      cover: a.cover ?? '',
    })),
  };
}

export default function AnimePosts() {
  const { malId: malIdParam } = useParams<{ malId: string }>();
  const navigate = useNavigate();
  const malId = malIdParam ? parseInt(malIdParam, 10) : undefined;

  const [page, setPage] = useState(1);

  const { anime, notFound, loading: animeLoading } = useAnimeDetail(malId);
  const { posts, pagination, loading, error } = useAnimePosts(malId, {
    page,
    limit: 10,
    sortBy: 'likes',
  });

  if (notFound) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.empty}>Anime not found.</p>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => navigate('/animes')}
          >
            ← Back to catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Seo
        title={`Posts about ${anime?.name ?? 'anime'}`}
        description={`Read Rekko community posts and recommendations about ${anime?.name ?? 'this anime'}.`}
        canonicalPath={malId !== undefined ? `/animes/${malId}/posts` : '/animes'}
        image={anime?.imgMedium || anime?.imgLarge || '/rekko_logo.png'}
        jsonLd={[
          pageJsonLd({
            type: 'CollectionPage',
            path: malId !== undefined ? `/animes/${malId}/posts` : '/animes',
            name: `Posts about ${anime?.name ?? 'anime'}`,
            description: `Community posts and recommendations about ${anime?.name ?? 'this anime'} on Rekko.`,
            image: anime?.imgMedium || anime?.imgLarge,
          }),
          itemListJsonLd(
            `Posts about ${anime?.name ?? 'anime'}`,
            malId !== undefined ? `/animes/${malId}/posts` : '/animes',
            posts.slice(0, 10).map((post) => ({
              name: post.text.slice(0, 90) || `Post about ${anime?.name ?? 'anime'}`,
              url: `/post/${post.id}`,
              image: post.userImage,
            })),
          ),
        ]}
      />
      <div className={styles.container}>
        {malId !== undefined && (
          <Link to={`/animes/${malId}`} className={styles.backLink}>
            ← Back to anime
          </Link>
        )}
        <div className={styles.header}>
          <div className={styles.cover}>
            {anime?.imgMedium && (
              <img src={anime.imgMedium} alt={anime.name} className="w-full h-full object-cover" />
            )}
          </div>
          <h1 className={styles.title}>
            Posts about {anime?.name ?? (animeLoading ? '…' : 'this anime')}
          </h1>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {loading && <p className={styles.loading}>Loading posts…</p>}
        {!loading && posts.length === 0 && !error && (
          <p className={styles.empty}>No posts about this anime yet.</p>
        )}

        <div className={styles.list}>
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={toPost(p)}
              fallbackRelatedAnimes={anime ? [{
                id: String(anime.malId),
                title: anime.name,
                cover: anime.imgMedium || anime.imgLarge || '',
              }] : []}
            />
          ))}
        </div>

        {pagination && pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
