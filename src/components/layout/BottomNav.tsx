import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Clapperboard, ListChecks } from 'lucide-react';
import rekkoSword from '@/assets/rekko_sword.png';
import { useAuthStore } from '@/store/useAuthStore';
import CreatePostModal from '@/components/ui/post/CreatePostModal';

const TABS_LEFT = [
  { label: 'Feed', to: '/feed', Icon: Home },
  { label: 'List', to: '/list', Icon: ListChecks },
];

const TABS_RIGHT = [
  { label: 'Explore', to: '/explore', Icon: Compass },
  { label: 'Animes', to: '/animes', Icon: Clapperboard },
];

const styles = {
  nav: 'fixed bottom-0 inset-x-0 z-50 lg:hidden bg-surface border-t-[1.5px] border-border font-gabarito pb-[env(safe-area-inset-bottom)]',
  inner: 'grid grid-cols-5 items-stretch h-16',
  tab: 'flex flex-col items-center justify-center gap-1 text-[10px] transition-colors',
  tabIdle: 'text-text-secondary',
  tabActive: 'text-primary font-semibold',
  centerWrap: 'relative flex items-start justify-center',
  centerBtn:
    'absolute -top-6 w-[60px] h-[60px] rounded-full bg-gradient-cta shadow-card flex items-center justify-center active:scale-95 transition-transform',
  centerSword: 'h-[32px] w-[32px] object-contain pointer-events-none brightness-0 invert',
};

function Tab({ label, to, Icon }: { label: string; to: string; Icon: typeof Home }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.tab} ${isActive ? styles.tabActive : styles.tabIdle}`
      }
    >
      <Icon size={20} strokeWidth={2} />
      {label}
    </NavLink>
  );
}

/**
 * Mobile bottom navigation — the central logo button opens the
 * "Post something!" modal (or sends guests to /login).
 */
export default function BottomNav() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [showPostModal, setShowPostModal] = useState(false);

  function handleCenterClick() {
    if (user) setShowPostModal(true);
    else navigate('/login');
  }

  return (
    <>
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.inner}>
          {TABS_LEFT.map((tab) => (
            <Tab key={tab.to} {...tab} />
          ))}

          <div className={styles.centerWrap}>
            <button
              type="button"
              className={styles.centerBtn}
              onClick={handleCenterClick}
              aria-label="Post something"
            >
              <img src={rekkoSword} alt="" className={styles.centerSword} />
            </button>
          </div>

          {TABS_RIGHT.map((tab) => (
            <Tab key={tab.to} {...tab} />
          ))}
        </div>
      </nav>

      <CreatePostModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
    </>
  );
}
