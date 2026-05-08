import { useNavigate, NavLink } from 'react-router-dom';
import rekkoLogo  from '@/assets/rekko_logo.png';
import rekkoSword from '@/assets/rekko_sword.png';
import SearchBar  from '@/components/ui/common/SearchBar';
import Avatar     from '@/components/ui/common/Avatar';
import Button     from '@/components/ui/common/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/lib/authService';
import { getStoredRefreshToken } from '@/lib/tokenStorage';

const TABS = [
  { label: 'Feed',    to: '/feed'    },
  { label: 'List',    to: '/list'    },
  { label: 'Explore', to: '/explore' },
  { label: 'Animes',  to: '/animes'  },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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

      {/* Row 1 — header */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-[6%] h-[90px]">
        <img src={rekkoLogo} alt="Rekko" className="h-[100px]" />

        <SearchBar />

        <div className="flex items-center gap-3 justify-end">
          {user ? (
            <>
              {/* Post CTA pill */}
              <div className="relative inline-flex items-center">
                <button className="bg-gradient-cta text-white font-gabarito rounded-pill h-[36px] pl-5 pr-12 text-base border-none cursor-pointer whitespace-nowrap">
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

    </nav>
  );
}
