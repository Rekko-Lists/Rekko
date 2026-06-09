import { Images, User, Headphones, Smile, Check, X, Minus } from 'lucide-react';

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
  opening: Headphones,
  emoji: Smile,
};

const LABELS: Record<ChallengeType, string> = {
  anime: 'Anime',
  character: 'Character',
  opening: 'Opening',
  emoji: 'Emoji',
};

const STATE_BADGE: Partial<Record<TabState, React.ElementType>> = {
  solved: Check,
  failed: X,
  skipped: Minus,
};

const styles = {
  row: 'flex items-center justify-center gap-4 mb-4',

  cloud: 'relative cursor-pointer select-none group',

  // Larger cloud — icon fits in the hole
  cloudImg: 'w-[150px] h-[106px] object-contain transition-opacity duration-200',
  cloudImgActive:  'opacity-100',
  cloudImgSolved:  'opacity-90',
  cloudImgFailed:  'opacity-80',
  cloudImgSkipped: 'opacity-40',
  cloudImgNeutral: 'opacity-55 group-hover:opacity-75',

  // Icon sits centered in the cloud hole
  iconWrapper: 'absolute inset-0 flex items-center justify-center',

  // All icons are dark gray — active gets darkest, neutral lighter
  iconActive:  'text-gray-800',
  iconSolved:  'text-gray-700',
  iconFailed:  'text-gray-500',
  iconSkipped: 'text-gray-400',
  iconNeutral: 'text-gray-400 group-hover:text-gray-600',

  badge: 'absolute top-0.5 right-2 w-5 h-5 rounded-full flex items-center justify-center',
  badgeSolved:  'bg-status-green text-white',
  badgeFailed:  'bg-status-red text-white',
  badgeSkipped: 'bg-border text-text-muted',
};

const CLOUD_IMG_CLASS: Record<TabState, string> = {
  active:  styles.cloudImgActive,
  solved:  styles.cloudImgSolved,
  failed:  styles.cloudImgFailed,
  skipped: styles.cloudImgSkipped,
  neutral: styles.cloudImgNeutral,
};

const ICON_CLASS: Record<TabState, string> = {
  active:  styles.iconActive,
  solved:  styles.iconSolved,
  failed:  styles.iconFailed,
  skipped: styles.iconSkipped,
  neutral: styles.iconNeutral,
};

const BADGE_CLASS: Partial<Record<TabState, string>> = {
  solved:  styles.badgeSolved,
  failed:  styles.badgeFailed,
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
            className={styles.cloud}
            aria-label={LABELS[tab.type]}
          >
            <img
              src="/rekko_slot_cloud.png"
              alt=""
              className={`${styles.cloudImg} ${CLOUD_IMG_CLASS[currentState]}`}
            />

            {/* Icon centered in the cloud hole */}
            <div className={styles.iconWrapper}>
              <Icon size={18} strokeWidth={2} className={ICON_CLASS[currentState]} />
            </div>

            {/* State badge (solved / failed / skipped) */}
            {BadgeIcon && badgeClass && (
              <span className={`${styles.badge} ${badgeClass}`}>
                <BadgeIcon size={11} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
