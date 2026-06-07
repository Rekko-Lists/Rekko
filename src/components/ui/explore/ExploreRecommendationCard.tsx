import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PostDetailData, PostAnimeSummary } from '@/lib/postService';

export interface ExploreRecommendationItem {
  post: PostDetailData;
  sourceAnime?: PostAnimeSummary;
  relatedAnimes: PostAnimeSummary[];
}

interface Props {
  item: ExploreRecommendationItem;
}

const styles = {
  card: 'relative flex min-h-[440px] flex-col items-center text-center',
  animeStage: 'relative flex w-full justify-center pt-3',
  sourceLink: 'group relative z-20 block w-[142px] sm:w-[156px]',
  sourceCover: 'aspect-[2/3] w-full rounded-[18px] border-[3px] border-white bg-gradient-to-br from-slate-300 to-slate-800 object-cover shadow-[0_18px_36px_rgba(0,0,0,0.28)] transition group-hover:-translate-y-1',
  sourceName: 'mt-2 line-clamp-2 text-sm font-black leading-tight text-text-main group-hover:text-primary',
  relatedRow: 'absolute left-1/2 top-[92px] z-10 flex w-full -translate-x-1/2 justify-center gap-2 px-2 sm:gap-3',
  relatedLink: 'group block w-[58px] translate-y-8 first:-translate-x-8 last:translate-x-8 sm:w-[66px]',
  relatedCover: 'aspect-[2/3] w-full rounded-[12px] border-2 border-white bg-gradient-to-br from-slate-300 to-slate-800 object-cover shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition group-hover:-translate-y-1 group-hover:rotate-0',
  content: 'mt-10 flex flex-1 flex-col items-center px-2',
  likes: 'mb-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-[24px] font-black leading-none text-white shadow-[0_10px_24px_rgba(255,158,0,0.35)]',
  title: 'line-clamp-2 max-w-[300px] text-[20px] font-black leading-tight text-text-main hover:text-primary',
  text: 'mt-2 line-clamp-3 max-w-[330px] text-center text-sm leading-snug text-text-muted hover:text-text-main',
  user: 'mt-auto flex flex-col items-center pt-5',
  avatar: 'h-12 w-12 rounded-full border-2 border-white bg-gradient-to-br from-slate-300 to-slate-700 object-cover shadow-card',
  username: 'mt-2 text-sm font-black text-text-main hover:text-primary',
  handle: 'text-[12px] text-text-muted',
};

function animeCover(anime?: PostAnimeSummary) {
  return anime ? anime.imgMedium || anime.imgLarge : '';
}

function animeName(anime?: PostAnimeSummary) {
  return anime?.name ?? 'Recommendation';
}

export default function ExploreRecommendationCard({ item }: Props) {
  const { post, sourceAnime, relatedAnimes } = item;
  const username = post.user?.username ?? 'Deleted user';
  const postText = post.description?.trim();

  return (
    <article className={styles.card}>
      <div className={styles.animeStage}>
        {sourceAnime ? (
          <Link to={`/animes/${sourceAnime.malId}`} className={styles.sourceLink}>
            {animeCover(sourceAnime) ? (
              <img src={animeCover(sourceAnime)} alt="" className={styles.sourceCover} />
            ) : (
              <div className={styles.sourceCover} />
            )}
            <span className={styles.sourceName}>{animeName(sourceAnime)}</span>
          </Link>
        ) : null}

        <div className={styles.relatedRow}>
          {relatedAnimes.slice(0, 3).map((anime) => (
            <Link key={anime.malId} to={`/animes/${anime.malId}`} className={styles.relatedLink} title={anime.name}>
              {animeCover(anime) ? (
                <img src={animeCover(anime)} alt="" className={styles.relatedCover} />
              ) : (
                <div className={styles.relatedCover} />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.likes} aria-label={`${post.likes} likes`}>
          <Flame size={28} fill="currentColor" /> {post.likes}
        </div>
        <Link to={`/post/${post.postId}`} className={styles.title}>
          {post.title}
        </Link>
        {postText ? (
          <Link to={`/post/${post.postId}`} className={styles.text}>
            {postText}
          </Link>
        ) : null}

        <Link to={post.user?.username ? `/profile/${post.user.username}` : '#'} className={styles.user}>
          {post.user?.profileImage ? (
            <img src={post.user.profileImage} alt="" className={styles.avatar} />
          ) : (
            <div className={styles.avatar} />
          )}
          <span className={styles.username}>{username}</span>
          <span className={styles.handle}>@{username}</span>
        </Link>
      </div>
    </article>
  );
}
