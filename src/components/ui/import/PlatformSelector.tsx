import { Check } from 'lucide-react';
import type { ImportPlatform } from '@/lib/importService';

export type { ImportPlatform };

interface PlatformMeta {
  id: ImportPlatform;
  name: string;
  tagline: string;
  /** Brand color used for accents, ring and the logo tile. */
  brand: string;
  brandDark: string;
  /** Inline logo mark rendered on a white tile. */
  Logo: () => JSX.Element;
}

// MyAnimeList — navy brand, "MAL" monogram in its signature blue.
function MalLogo() {
  return (
    <span className="font-extrabold tracking-tight text-[15px]" style={{ color: '#2e51a2' }}>
      MAL
    </span>
  );
}

// AniList — bright cyan-blue brand, geometric "A" mark approximating the logo.
function AniListLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.9 4H4.2v16h3.5v-5.1l4.6 5.1h4.5L11 13.3 16.9 4h-4.2l-3.2 5.4z"
        fill="#02a9ff"
      />
      <rect x="14.5" y="4" width="5.3" height="3.4" rx="1.1" fill="#02a9ff" />
    </svg>
  );
}

const PLATFORMS: PlatformMeta[] = [
  {
    id: 'mal',
    name: 'MyAnimeList',
    tagline: 'Import your exported XML',
    brand: '#2e51a2',
    brandDark: '#1f3b7a',
    Logo: MalLogo,
  },
  {
    id: 'anilist',
    name: 'AniList',
    tagline: 'Import by username',
    brand: '#02a9ff',
    brandDark: '#0264d6',
    Logo: AniListLogo,
  },
];

interface Props {
  selected: ImportPlatform | null;
  onSelect: (platform: ImportPlatform) => void;
}

export default function PlatformSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PLATFORMS.map((p) => {
        const active = selected === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-[14px] border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderColor: active ? p.brand : 'transparent',
              background: active
                ? `linear-gradient(135deg, ${p.brand}14, ${p.brandDark}0a)`
                : 'var(--surface, #fff)',
              boxShadow: active
                ? `0 8px 22px ${p.brand}33`
                : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {/* Brand glow on hover */}
            <span
              className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
              style={{ background: p.brand }}
            />

            {/* Logo tile */}
            <span
              className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-white shadow-sm ring-1 ring-black/5"
            >
              <p.Logo />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-main">{p.name}</p>
              <p className="text-[11px] text-text-secondary">{p.tagline}</p>
            </div>

            {/* Selected check */}
            {active && (
              <span
                className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white"
                style={{ background: p.brand }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
