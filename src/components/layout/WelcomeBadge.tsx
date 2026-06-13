import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { isNewUser, isWelcomeDismissed } from '@/lib/welcome';

interface Props {
  /** Compact variant for the mobile header. */
  compact?: boolean;
}

/**
 * "Welcome setup" entry point shown next to the logo during a user's first
 * week. Brand-gradient pill with an anime sparkle and a shimmer sweep on hover.
 * Renders nothing once the window has passed or the user dismissed it.
 */
export default function WelcomeBadge({ compact = false }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user || !isNewUser(user.createdAt) || isWelcomeDismissed()) return null;

  return (
    <Link
      to="/welcome"
      aria-label="Welcome setup"
      title="Welcome setup"
      className={`group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full font-gabarito font-semibold text-white shadow-card ${
        compact ? 'h-[30px] px-2.5 text-[11px]' : 'h-[34px] px-3.5 text-xs'
      }`}
      style={{ background: 'linear-gradient(135deg, #FF9E00 0%, #E89308 45%, #212834 130%)' }}
    >
      <Sparkles size={compact ? 12 : 14} className="drop-shadow" />
      <span className="whitespace-nowrap">{compact ? 'Welcome' : 'Welcome setup'}</span>

      {/* Shimmer sweep on hover */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:animate-shimmer"
        style={{
          backgroundImage:
            'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
      />
    </Link>
  );
}
