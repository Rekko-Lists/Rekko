import { Edit, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Avatar from '@/components/ui/common/Avatar';
import PostCard from '@/components/ui/feed/PostCard';
import rekkoSword from '@/assets/rekko_sword.png';
import type { Post } from '@/store/useFeedStore';

const MOCK_POST: Post = {
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
};

const MOCK_LIST = [
  { id: '1', title: 'Steins;Gate', situation: 'Finished Airing', progress: '24/24', score: 9 },
];

const styles = {
  page:         'font-gabarito relative',
  contentWrap:  'flex flex-col gap-6 px-[6%] py-6',
  bannerWrap:   'relative',
  banner:       'bg-gradient-banner rounded-card h-[153px] relative overflow-hidden',
  bannerClouds: 'absolute inset-0 bg-cover bg-center opacity-30',
  editBtn:      'absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors',
  avatarWrap:   'absolute -bottom-[59px] left-8',
  mainRow:      'flex gap-6 mt-16',
  leftCol:      'flex-1 flex flex-col gap-6 min-w-0',
  userInfo:     'pl-2',
  userHandle:   'text-sm text-text-muted',
  userName:     'text-[28px] font-semibold text-text-main leading-tight',
  miniTable:    'bg-surface border border-border rounded-card shadow-card overflow-hidden',
  tableHead:    'flex',
  thImg:        'bg-primary text-white text-xs font-semibold px-3 py-1.5 w-[86px]',
  th:           'text-xs font-semibold text-text-secondary px-3 py-1.5',
  tableRow:     'flex items-center border-t border-border',
  tdImg:        'w-[86px] px-3 py-2',
  imgCircle:    'w-[73px] h-[74px] rounded-full bg-gradient-to-br from-slate-400 to-slate-700',
  tdText:       'flex-1 px-3 py-2 text-sm text-text-main',
  tdScore:      'px-3 py-2 flex items-center gap-1 text-sm font-semibold',
  swordDeco:    'absolute right-0 top-1/2 -translate-y-1/2 h-[160px] object-contain rotate-[-20deg] opacity-70 pointer-events-none',
};

export default function Profile() {
  const { username } = useParams<{ username: string }>();

  return (
    <div className={styles.page}>
      <div className={styles.contentWrap}>
        {/* Banner + Avatar */}
        <div className={styles.bannerWrap}>
          <div className={styles.banner}>
            <div
              className={styles.bannerClouds}
              style={{ backgroundImage: 'url(/bg_clouds.png)' }}
            />
            <button className={styles.editBtn}>
              <Edit size={14} className="text-text-main" />
            </button>
          </div>
          <div className={styles.avatarWrap}>
            <Avatar size="lg" className="border-4 border-surface shadow-card" />
          </div>
          <img src={rekkoSword} alt="" className={styles.swordDeco} />
        </div>

        <div className={styles.mainRow}>
          <div className={styles.leftCol}>
            <div className={styles.userInfo}>
              <p className={styles.userHandle}>@{username ?? 'username'}</p>
              <h1 className={styles.userName}>{username ?? 'Username'} List -</h1>
            </div>

            {/* Mini anime list */}
            <div className={styles.miniTable}>
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
                    {e.score} <Star size={16} fill="#FF9E00" className="text-primary" />
                  </div>
                </div>
              ))}
            </div>

            {/* Post card */}
            <PostCard post={MOCK_POST} />
          </div>
        </div>
      </div>
    </div>
  );
}
