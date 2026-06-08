import { useEffect, useRef, useState } from 'react';
import { Edit, Star, Settings as SettingsIcon, Image } from 'lucide-react';
import {
  FaTwitter, FaInstagram, FaGithub, FaYoutube, FaTwitch,
  FaLinkedin, FaDiscord, FaTiktok,
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/common/Avatar';
import Button from '@/components/ui/common/Button';
import Spinner from '@/components/ui/common/Spinner';
import PostCard from '@/components/ui/feed/PostCard';
import ImageUploadModal, { type UploadImageType } from '@/components/ui/profile/ImageUploadModal';
import rekkoSword from '@/assets/rekko_sword.png';
import { authService } from '@/lib/authService';
import type { PublicProfile } from '@/lib/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { logger } from '@/lib/logger';
import type { Post } from '@/store/useFeedStore';
import Seo from '@/components/seo/Seo';
import { absoluteUrl, pageJsonLd } from '@/components/seo/jsonLd';
import { deletePost, getPostsByUsername, likePost, toFeedPost, unlikePost } from '@/lib/postService';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

const SOCIAL_ICONS: Record<string, IconComponent> = {
  twitter: FaTwitter,
  instagram: FaInstagram,
  github: FaGithub,
  youtube: FaYoutube,
  twitch: FaTwitch,
  linkedin: FaLinkedin,
  discord: FaDiscord,
  tiktok: FaTiktok,
};

const MOCK_LIST = [
  { id: '1', title: 'Steins;Gate', situation: 'Finished Airing', progress: '24/24', score: 9 },
];

const styles = {
  tableHead: 'flex',
  thImg:     'bg-primary text-white text-xs font-semibold px-3 py-1.5 w-[86px] flex-shrink-0',
  th:        'text-xs font-semibold text-text-secondary px-3 py-1.5',
  tableRow:  'flex items-center border-t border-border',
  tdImg:     'w-[86px] px-3 py-2 flex-shrink-0',
  imgCircle: 'w-[55px] h-[55px] rounded-full bg-gradient-to-br from-slate-400 to-slate-700',
  tdText:    'flex-1 px-3 py-2 text-sm text-text-main',
  tdScore:   'px-3 py-2 flex items-center gap-1 text-sm font-semibold',
};

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate     = useNavigate();
  const { user, setUser } = useAuthStore();

  const [profileUser, setProfileUser] = useState<PublicProfile | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [loadError,   setLoadError]   = useState(false);
  const [uploadModal, setUploadModal] = useState<UploadImageType | null>(null);

  // Posts infinite scroll
  const [posts, setPosts]               = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const sentinelRef      = useRef<HTMLDivElement>(null);
  const postsPageRef     = useRef(0);
  const postsLoadingRef  = useRef(false);
  const postsHasMoreRef  = useRef(true);
  const activeUsername   = useRef<string | undefined>(undefined);
  const abortPostsRef    = useRef<AbortController | null>(null);
  const likingPostsRef   = useRef(new Set<string>());

  const isOwnProfile = !!user && user.username === username;

  // Load profile info
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    authService.getPublicProfile(username)
      .then(data => { setProfileUser(data); logger.info('Profile loaded', data); })
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        logger.error('Profile load error', err);
        if (status === 404) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [username]);

  function loadPostsPage(targetUsername: string, page: number, signal?: AbortSignal) {
    if (postsLoadingRef.current) return;
    postsLoadingRef.current = true;
    setPostsLoading(true);
    getPostsByUsername(targetUsername, { page, limit: 10 }, signal)
      .then(result => {
        if (activeUsername.current !== targetUsername) return;
        const mapped = result.posts.map(toFeedPost);
        const hasMore = page < result.pagination.pages;
        setPosts(prev => page === 1 ? mapped : [...prev, ...mapped]);
        postsHasMoreRef.current = hasMore;
        setPostsHasMore(hasMore);
        postsPageRef.current = page;
      })
      .catch((err: unknown) => { logger.error('Failed to load posts', err); postsHasMoreRef.current = false; setPostsHasMore(false); })
      .finally(() => {
        postsLoadingRef.current = false;
        setPostsLoading(false);
      });
  }

  // Reset + initial load when username changes
  useEffect(() => {
    if (!username) return;
    abortPostsRef.current?.abort();
    abortPostsRef.current = new AbortController();
    activeUsername.current   = username;
    postsPageRef.current     = 0;
    postsLoadingRef.current  = false;
    postsHasMoreRef.current  = true;
    setPosts([]);
    setPostsHasMore(true);
    loadPostsPage(username, 1, abortPostsRef.current.signal);
    return () => abortPostsRef.current?.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      if (postsLoadingRef.current || !postsHasMoreRef.current) return;
      const u = activeUsername.current;
      if (!u) return;
      loadPostsPage(u, postsPageRef.current + 1, abortPostsRef.current?.signal);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePostLike(id: string) {
    if (likingPostsRef.current.has(id)) return;
    const postId = Number(id);
    if (!Number.isFinite(postId)) return;

    const current = posts.find((p) => p.id === id);
    if (!current) return;

    likingPostsRef.current.add(id);
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1 }
          : p,
      ),
    );

    try {
      if (current.liked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, liked: current.liked, likes: current.likes }
            : p,
        ),
      );
    } finally {
      likingPostsRef.current.delete(id);
    }
  }

  async function handlePostDelete(id: string) {
    const postId = Number(id);
    if (!Number.isFinite(postId)) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      logger.error('Failed to delete post', err);
    }
  }

  function handleUploadSuccess(imageUrl: string) {
    setProfileUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...(uploadModal === 'profile'    ? { profileImage:    imageUrl } :
           uploadModal === 'banner'     ? { bannerImage:     imageUrl } :
                                          { backgroundImage: imageUrl }),
      };
    });
    if (uploadModal === 'profile') {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) setUser({ ...currentUser, profileImage: imageUrl });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] font-gabarito">
        <Spinner />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 font-gabarito">
        <p className="text-6xl font-semibold text-text-muted">404</p>
        <p className="text-xl text-text-secondary">User not found</p>
        <Button variant="amber" onClick={() => navigate('/feed')}>Back to feed</Button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 font-gabarito">
        <p className="text-xl text-text-secondary">Couldn't load this profile. Please try again.</p>
        <Button variant="amber" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const socialAccounts = profileUser?.socialAccounts ?? [];

  return (
    <div className="relative font-gabarito overflow-x-hidden" style={{ minHeight: '100%' }}>
      <Seo
        title={`${profileUser?.username ?? username}`}
        description={profileUser?.biography || `View ${profileUser?.username ?? username}'s anime profile, list, and posts on Rekko.`}
        canonicalPath={`/profile/${username}`}
        image={profileUser?.profileImage || '/rekko_logo.png'}
        jsonLd={[
          pageJsonLd({
            type: 'ProfilePage',
            path: `/profile/${username}`,
            name: `${profileUser?.username ?? username}`,
            description: profileUser?.biography || `Anime profile for ${profileUser?.username ?? username} on Rekko.`,
            image: profileUser?.profileImage,
          }),
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profileUser?.username ?? username,
            url: absoluteUrl(`/profile/${username}`),
            image: profileUser?.profileImage ? absoluteUrl(profileUser.profileImage) : undefined,
            description: profileUser?.biography,
          },
        ]}
      />

      {/* Full-page background */}
      <div
        className="absolute inset-0 bg-app-bg bg-cover bg-center"
        style={profileUser?.backgroundImage ? { backgroundImage: `url(${profileUser.backgroundImage})` } : {}}
      />
    <div
      className="relative font-gabarito overflow-x-hidden min-h-full bg-app-bg bg-cover bg-center"
      style={
        profileUser?.backgroundImage
          ? { backgroundImage: `url(${profileUser.backgroundImage})`, backgroundAttachment: 'fixed' }
          : {}
      }
    >

      {/* Background change button (own profile only) */}
      {isOwnProfile && (
        <button
          className="absolute top-3 right-4 z-10 flex items-center gap-1.5 text-xs bg-black/40 hover:bg-black/60 text-white rounded-[5px] px-2.5 py-1.5 transition-colors"
          onClick={() => setUploadModal('background')}
        >
          <Image size={13} /> Background
        </button>
      )}

      {/* Sword decoration */}
      <img
        src={rekkoSword}
        alt=""
        className="absolute right-2 top-[60px] h-[220px] object-contain rotate-[-20deg] opacity-75 pointer-events-none z-10"
      />

      {/* Profile card */}
      <div className="relative max-w-[760px] mx-auto bg-surface border-[1.5px] border-border border-top-none min-h-screen">

        {/* Banner area */}
        <div className="relative h-[153px] bg-gradient-banner overflow-hidden">
          {profileUser?.bannerImage && (
            <img src={profileUser.bannerImage} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {isOwnProfile && (
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              onClick={() => setUploadModal('banner')}
            >
              <Edit size={13} className="text-text-main" />
            </button>
          )}
        </div>

        {/* Avatar — overlaps banner bottom */}
        <div className="absolute top-[94px] left-8">
          <div className="relative">
            <Avatar
              src={profileUser?.profileImage}
              username={profileUser?.username}
              size="lg"
              className="border-4 border-surface shadow-card"
            />
            {isOwnProfile && (
              <button
                className="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full border border-border flex items-center justify-center shadow-card hover:bg-app-bg transition-colors"
                onClick={() => setUploadModal('profile')}
              >
                <Edit size={11} className="text-text-main" />
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="px-8 pt-[72px] pb-10 flex flex-col gap-6">

          {/* User info */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">@{profileUser?.username ?? username}</span>
              {isOwnProfile && (
                <button
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-primary border border-border rounded-[5px] px-2 py-0.5 transition-colors"
                  onClick={() => navigate('/settings')}
                >
                  <SettingsIcon size={12} /> Settings
                </button>
              )}
            </div>
            <h1 className="text-[28px] font-semibold text-text-main leading-tight">
              {profileUser?.username ?? username} List -
            </h1>
            {profileUser?.biography && (
              <p className="text-sm text-text-secondary mt-1">{profileUser.biography}</p>
            )}

            {/* Social links */}
            {socialAccounts.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                {socialAccounts.map((sa) => {
                  const platformName = sa.name.toLowerCase();
                  const IconComp = SOCIAL_ICONS[platformName];
                  if (!IconComp) return null;
                  return (
                    <a
                      key={platformName}
                      href={sa.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${platformName}: ${sa.url}`}
                      className="text-text-muted hover:text-primary transition-colors"
                    >
                      <IconComp size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Anime list — mock until anime API is integrated */}
          <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
            <div className={styles.tableHead}>
              <span className={styles.thImg}>Image</span>
              <span className={styles.th}>Status</span>
              <span className={styles.th}>Situation</span>
              <span className={styles.th}>Progress</span>
              <span className={styles.th}>Score</span>
            </div>
            {MOCK_LIST.map(e => (
              <div key={e.id} className={styles.tableRow}>
                <div className={styles.tdImg}><div className={styles.imgCircle} /></div>
                <div className={styles.tdText}>{e.title}</div>
                <div className={styles.tdText}>{e.situation}</div>
                <div className={styles.tdText}>{e.progress}</div>
                <div className={styles.tdScore}>
                  {e.score} <Star size={15} fill="#FF9E00" className="text-primary" />
                </div>
              </div>
            ))}
          </div>

          {/* Real posts */}
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handlePostLike}
                onDelete={handlePostDelete}
              />
            ))}

            {postsLoading && (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            )}

            {!postsLoading && !postsHasMore && posts.length === 0 && (
              <p className="text-center text-sm text-text-muted py-4">No posts yet.</p>
            )}

            <div ref={sentinelRef} className="h-4" />
          </div>
        </div>
      </div>

      {/* Image upload modal */}
      {uploadModal && username && (
        <ImageUploadModal
          type={uploadModal}
          username={username}
          onSuccess={handleUploadSuccess}
          onClose={() => setUploadModal(null)}
        />
      )}
    </div>
  </div>
  );
}
