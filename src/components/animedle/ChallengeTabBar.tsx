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
  row: 'flex items-center justify-center gap-5 mb-4',

  cloud: 'relative flex flex-col items-center gap-1.5 cursor-pointer select-none group',

  cloudImg: 'w-[100px] h-[72px] object-contain transition-all duration-200',
  cloudImgActive: 'opacity-100 drop-shadow-[0_0_8px_rgba(255,158,0,0.7)]',
  cloudImgSolved: 'opacity-100 drop-shadow-[0_0_6px_rgba(78,187,34,0.6)]',
  cloudImgFailed: 'opacity-90 drop-shadow-[0_0_6px_rgba(255,100,100,0.5)]',
  cloudImgSkipped: 'opacity-50',
  cloudImgNeutral: 'opacity-60 group-hover:opacity-80',

  iconWrapper: 'absolute inset-0 flex items-center justify-center pb-2',

  iconActive: 'text-primary',
  iconSolved: 'text-status-green',
  iconFailed: 'text-status-red',
  iconSkipped: 'text-text-muted',
  iconNeutral: 'text-text-muted group-hover:text-text-secondary',

  label: 'text-[11px] font-semibold tracking-wide transition-colors duration-150',
  labelActive: 'text-primary',
  labelSolved: 'text-status-green',
  labelFailed: 'text-status-red',
  labelSkipped: 'text-text-muted',
  labelNeutral: 'text-text-muted group-hover:text-text-secondary',

  badge: 'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
  badgeSolved: 'bg-status-green text-white',
  badgeFailed: 'bg-status-red text-white',
  badgeSkipped: 'bg-border text-text-muted',
};

const CLOUD_IMG_CLASS: Record<TabState, string> = {
  active: styles.cloudImgActive,
  solved: styles.cloudImgSolved,
  failed: styles.cloudImgFailed,
  skipped: styles.cloudImgSkipped,
  neutral: styles.cloudImgNeutral,
};

const ICON_CLASS: Record<TabState, string> = {
  active: styles.iconActive,
  solved: styles.iconSolved,
  failed: styles.iconFailed,
  skipped: styles.iconSkipped,
  neutral: styles.iconNeutral,
};

const LABEL_CLASS: Record<TabState, string> = {
  active: styles.labelActive,
  solved: styles.labelSolved,
  failed: styles.labelFailed,
  skipped: styles.labelSkipped,
  neutral: styles.labelNeutral,
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
            className={styles.cloud}
            aria-label={LABELS[tab.type]}
          >
            {/* Cloud image */}
            <div className="relative">
              <img
                src="/rekko_slot_cloud.png"
                alt=""
                className={`${styles.cloudImg} ${CLOUD_IMG_CLASS[currentState]}`}
              />

              {/* Icon centered on the cloud */}
              <div className={styles.iconWrapper}>
                <Icon size={26} strokeWidth={1.8} className={ICON_CLASS[currentState]} />
              </div>

              {/* State badge (solved / failed / skipped) */}
              {BadgeIcon && badgeClass && (
                <span className={`${styles.badge} ${badgeClass}`}>
                  <BadgeIcon size={11} strokeWidth={3} />
                </span>
              )}
            </div>

            {/* Label below cloud */}
            <span className={`${styles.label} ${LABEL_CLASS[currentState]}`}>
              {LABELS[tab.type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
