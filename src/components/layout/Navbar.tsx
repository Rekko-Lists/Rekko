import { NavLink } from 'react-router-dom';
import rekkoLogo  from '@/assets/rekko_logo.png';
import rekkoSword from '@/assets/rekko_sword.png';

/**
 * Navbar — two rows separated by inset dividers (~6% margin each side).
 *
 * Row 1: [Logo]   [Post something! + sword]  [username]  [Avatar]
 * Row 2:          Feed  Animes  List  Explore   (centered, amber underline on active)
 *
 * Design ref: CLAUDE.md › Componentes clave › Navbar
 */

const TABS = [
  { label: 'Feed',    to: '/feed'    },
  { label: 'Animes',  to: '/animes'  },
  { label: 'List',    to: '/list'    },
  { label: 'Explore', to: '/explore' },
];

export default function Navbar() {
  return (
    <nav className="bg-app-bg w-full">

      {/* Row 1 — header */}
      <div className="flex items-center px-[6%] h-[70px]">
        <img src={rekkoLogo} alt="Rekko" className="h-[52px]" />

        <div className="ml-auto flex items-center gap-3">
          {/* Pill CTA — sword overlaps right end */}
          <div className="relative inline-flex items-center">
            <button className="bg-gradient-cta text-white font-gabarito rounded-pill h-[36px] pl-5 pr-12 text-base border-none cursor-pointer whitespace-nowrap">
              Post something!
            </button>
            <img src={rekkoSword} alt="" className="absolute right-1 h-[28px] pointer-events-none" />
          </div>

          {/* TODO: wire to useAuthStore */}
          <span className="font-gabarito text-sm text-text-main cursor-pointer">username</span>
          <div className="w-[34px] h-[34px] rounded-full bg-border-light" />
        </div>
      </div>

      {/* Divider 1 — inset */}
      <div className="h-[1.5px] bg-black/15 mx-[6%]" />

      {/* Row 2 — tabs (centered) */}
      <div className="flex items-center justify-center gap-10 h-[44px]">
        {TABS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `font-gabarito text-[15px] text-text-main h-full flex items-center relative
               ${isActive ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-primary after:rounded-sm' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Divider 2 — inset, same width as divider 1 */}
      <div className="h-[1.5px] bg-black/15 mx-[6%]" />

    </nav>
  );
}
