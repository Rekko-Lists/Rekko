import PostCard from '@/components/ui/feed/PostCard';
import AnimeNewsCard from '@/components/ui/feed/AnimeNewsCard';
import ReputationLeaderboard from '@/components/ui/feed/ReputationLeaderboard';
import PopularRecommendationsCard from '@/components/ui/feed/PopularRecommendationsCard';
import SiteLinks from '@/components/ui/common/SiteLinks';
import { useFeedStore, type Post } from '@/store/useFeedStore';
import type { RecommendationItem } from '@/components/ui/feed/PopularRecommendationsCard';
import type { SiteLinkItem } from '@/components/ui/common/SiteLinks';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    user: 'Username',
    time: '10 hours ago',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non diam nulla. Sed lectus orci, iaculis nec justo in, placerat interdum risus. Nunc eu venenatis nunc, vitae sollicitudin tortor. Integer ipsum',
    relatedAnimes: [
      { id: 'a1', title: 'Frieren', cover: '' },
      { id: 'a2', title: 'Frieren S2', cover: '' },
    ],
    userImage: '',
    likes: 50,
    comments: 5,
    liked: false,
  },
  {
    id: '2',
    user: 'Username',
    time: '10 hours ago',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non diam nulla. Sed lectus orci, iaculis nec justo in, placerat interdum risus. Nunc eu venenatis nunc, vitae sollicitudin tortor. Integer ipsum',
    relatedAnimes: [
      { id: 'a3', title: 'Steins;Gate', cover: '' },
      { id: 'a4', title: 'JJK', cover: '' },
    ],
    userImage: '',
    likes: 32,
    comments: 2,
    liked: false,
  },
];

const MOCK_NEWS = [
  { id: 'n1', title: "Sixth Season of 'Dungeon ni Deai wo Motomeru' Announced", date: 'Feb 7, 5:45 AM' },
  { id: 'n2', title: "'Alya-san Season 2' Postpones Broadcast to 2027", date: 'Feb 12, 2:39 PM' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, user: 'username', hearts: 1233 },
  { rank: 2, user: 'username', hearts: 987 },
  { rank: 3, user: 'username', hearts: 741 },
  { rank: 4, user: 'username', hearts: 523 },
];

const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  { id: 'r1', title: 'Anime title', hearts: 50 },
  { id: 'r2', title: 'Anime title', hearts: 38 },
];

const SITE_LINKS: SiteLinkItem[] = [
  { label: 'Rules of the site', icon: 'Book', href: '#' },
  { label: 'About', icon: 'Book', href: '#' },
  { label: 'FAQ', icon: 'Question', href: '#' },
];

const styles = {
  page:     'flex px-[6%] font-gabarito min-h-full',
  sidebar:  'w-[231px] flex-shrink-0 flex flex-col gap-4 py-6',
  center:   'flex-1 flex flex-col gap-4 min-w-0 py-6',
  divider:  'w-[1.5px] bg-black/15 self-stretch mx-5',
};

export default function Feed() {
  const toggleLike = useFeedStore(s => s.toggleLike);

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <AnimeNewsCard items={MOCK_NEWS} />
        <SiteLinks items={SITE_LINKS} />
      </aside>

      <div className={styles.divider} />

      <main className={styles.center}>
        {MOCK_POSTS.map(post => (
          <PostCard key={post.id} post={post} onLike={toggleLike} />
        ))}
      </main>

      <div className={styles.divider} />

      <aside className={styles.sidebar}>
        <ReputationLeaderboard entries={MOCK_LEADERBOARD} />
        <PopularRecommendationsCard items={MOCK_RECOMMENDATIONS} />
      </aside>
    </div>
  );
}
