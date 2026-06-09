import { Images, User, Music, Smile, Check, X, Minus } from 'lucide-react';

type ChallengeType = 'anime' | 'character' | 'opening' | 'emoji';
type TabState = 'neutral' | 'active' | 'solved' | 'failed' | 'skipped';

interface Tab {
  type: ChallengeType;
  state: TabState;
  index: number;
}

interface Props {
  tabs: Tab[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const ICONS: Record<ChallengeType, React.ElementType> = {
  anime: Images,
  character: User,
  opening: Music,
  emoji: Smile,
};

const LABELS: Record<ChallengeType, string> = {
  anime: 'Anime',
  character: 'Personaje',
  opening: 'Opening',
  emoji: 'Emojis',
};

// State badge icon: check for solved, X for failed, dash for skipped, nothing for neutral/active
const STATE_BADGE: Partial<Record<TabState, React.ElementType>> = {
  solved: Check,
  failed: X,
  skipped: Minus,
};

const styles = {
  // Tab row — Navbar row 2 style: border-b, full-width, centered
  row: 'flex items-end justify-center gap-0 w-full border-b border-border mb-3',

  // Individual tab button
  tabBase: 'relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium cursor-pointer transition-colors duration-150 select-none focus:outline-none',
  tabNeutral: 'text-text-muted hover:text-text-main',
  tabActive: 'text-text-main',
  tabSolved: 'text-status-green hover:text-status-green',
  tabFailed: 'text-status-red hover:text-status-red',
  tabSkipped: 'text-text-muted hover:text-text-muted',

  // Active indicator — amber underline at bottom of tab row (2px, same as Navbar)
  activeIndicator: 'absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-sm',

  // Small state badge chip
  badgeBase: 'inline-flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0',
  badgeSolved: 'bg-status-green text-white',
  badgeFailed: 'bg-status-red text-white',
  badgeSkipped: 'bg-border text-text-muted',
};

const TAB_TEXT_CLASS: Record<TabState, string> = {
  neutral: styles.tabNeutral,
  active: styles.tabActive,
  solved: styles.tabSolved,
  failed: styles.tabFailed,
  skipped: styles.tabSkipped,
};

const BADGE_CLASS: Partial<Record<TabState, string>> = {
  solved: styles.badgeSolved,
  failed: styles.badgeFailed,
  skipped: styles.badgeSkipped,
};

export default function ChallengeTabBar({ tabs, activeIndex, onSelect }: Props) {
  return (
    <div className={styles.row}>
      {tabs.map((tab) => {
        const Icon = ICONS[tab.type];
        const isActive = tab.index === activeIndex;
        const currentState: TabState = isActive ? 'active' : tab.state;
        const BadgeIcon = STATE_BADGE[currentState];
        const badgeClass = BADGE_CLASS[currentState];

        return (
          <button
            key={tab.index}
            onClick={() => onSelect(tab.index)}
            className={`${styles.tabBase} ${TAB_TEXT_CLASS[currentState]}`}
            aria-label={LABELS[tab.type]}
          >
            <Icon size={15} />
            <span>{LABELS[tab.type]}</span>

            {/* State badge (shown for solved / failed / skipped) */}
            {BadgeIcon && badgeClass && (
              <span className={`${styles.badgeBase} ${badgeClass}`}>
                <BadgeIcon size={10} strokeWidth={3} />
              </span>
            )}

            {/* Active amber underline */}
            {isActive && <span className={styles.activeIndicator} />}
          </button>
        );
      })}
    </div>
  );
}
