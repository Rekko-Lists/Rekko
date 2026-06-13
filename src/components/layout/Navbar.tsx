import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Swords } from 'lucide-react';
import rekkoLogo  from '@/assets/rekko_logo.png';
import rekkoSword from '@/assets/rekko_sword.png';
import SearchBar  from '@/components/ui/common/SearchBar';
import Avatar     from '@/components/ui/common/Avatar';
import Button     from '@/components/ui/common/Button';
import WelcomeBadge from '@/components/layout/WelcomeBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/lib/authService';
import { getStoredRefreshToken } from '@/lib/tokenStorage';
import CreatePostModal from '@/components/ui/post/CreatePostModal';

const TABS = [
  { label: 'Feed',    to: '/feed'    },
  { label: 'List',    to: '/list'    },
  { label: 'Explore', to: '/explore' },
  { label: 'Animes',  to: '/animes'  },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showPostModal, setShowPostModal] = useState(false);

  async function handleLogout() {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try { await authService.logout(refreshToken); } catch { /* ignore */ }
    }
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-app-bg w-full">

      {/* ── Mobile header (< lg) — compact: logo, search, animedle, avatar ── */}
      <div className="lg:hidden flex items-center gap-2 px-3 h-[60px]">
        <button onClick={() => navigate('/feed')} className="flex-shrink-0" aria-label="Home">
          <img src={rekkoLogo} alt="Rekko" className="h-[48px]" />
        </button>

        {user && <WelcomeBadge compact />}

        <div className="flex-1 min-w-0">
          <SearchBar />
        </div>

        {user ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/animedle')}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
              aria-label="Animedle"
              title="Animedle"
            >
              <Swords size={17} />
            </button>
            <button
              onClick={() => navigate(`/profile/${user.username}`)}
              aria-label="Profile"
            >
              <Avatar src={user.profileImage} username={user.username} size="sm" />
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-status-red transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="font-gabarito text-sm text-text-main border border-border rounded-pill px-3 h-[34px] whitespace-nowrap"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="font-gabarito text-sm text-white bg-gradient-cta rounded-pill px-3 h-[34px] whitespace-nowrap"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
      <div className="lg:hidden h-[1.5px] bg-black/15 mx-3" />

      {/* ── Desktop header (lg+) — original two-row layout ── */}
      <div className="hidden lg:block">
        {/* Row 1 — header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-[6%] h-[90px]">
          <div className="flex items-center gap-3 justify-self-start">
            <button
              onClick={() => navigate('/feed')}
              className="cursor-pointer"
              aria-label="Home"
            >
              <img src={rekkoLogo} alt="Rekko" className="h-[100px]" />
            </button>
            {user && <WelcomeBadge />}
          </div>

          <SearchBar />

          <div className="flex items-center gap-3 justify-end">
            {user ? (
              <>
                {/* Animedle shortcut */}
                <button
                  onClick={() => navigate('/animedle')}
                  className="font-gabarito text-sm text-text-main hover:text-primary transition-colors border border-border rounded-pill px-4 h-[36px] whitespace-nowrap cursor-pointer"
                >
                  Animedle
                </button>

                {/* Post CTA pill */}
                <div className="relative inline-flex items-center">
                  <button
                    className="bg-gradient-cta text-white font-gabarito rounded-pill h-[36px] pl-5 pr-12 text-base border-none cursor-pointer whitespace-nowrap"
                    onClick={() => setShowPostModal(true)}
                  >
                    Post something!
                  </button>
                  <img src={rekkoSword} alt="" className="absolute right-2 h-[50px] pointer-events-none" />
                </div>

                {/* Username + avatar → profile */}
                <button
                  className="flex items-center gap-2 group"
                  onClick={() => navigate(`/profile/${user.username}`)}
                >
                  <span className="font-gabarito text-sm text-text-main group-hover:text-primary transition-colors">
                    {user.username}
                  </span>
                  <Avatar src={user.profileImage} username={user.username} size="sm" />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="font-gabarito text-xs text-text-muted hover:text-status-red transition-colors cursor-pointer"
                  title="Log out"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Button variant="nav" onClick={() => navigate('/login')}>Log in</Button>
                <Button variant="nav" onClick={() => navigate('/register')}>Sign up</Button>
              </>
            )}
          </div>
        </div>

        {/* Divider 1 — inset */}
        <div className="h-[1.5px] bg-black/15 mx-[6%]" />

        {/* Row 2 — tabs */}
        <div className="flex items-center justify-center gap-10 h-[44px]">
          {TABS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-gabarito text-[15px] text-text-main h-full flex items-center relative
                 ${isActive ? 'after:absolute after:bottom-[-1.5px] after:left-0 after:right-0 after:h-[2.5px] after:bg-primary' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Divider 2 — inset */}
        <div className="h-[1px] bg-black/15 mx-[6%]" />
      </div>

      <CreatePostModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
    </nav>
  );
}
