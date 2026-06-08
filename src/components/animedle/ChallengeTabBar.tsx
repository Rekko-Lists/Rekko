import { Images, User, Music, Smile } from 'lucide-react';

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

const STATE_STYLES: Record<TabState, string> = {
  neutral: 'opacity-70 hover:opacity-100',
  active: 'opacity-100 scale-105',
  solved: 'opacity-100 brightness-110 drop-shadow-[0_0_6px_rgba(78,187,34,0.7)]',
  failed: 'opacity-100 drop-shadow-[0_0_6px_rgba(255,100,100,0.7)]',
  skipped: 'opacity-50',
};

const CLOUD_OVERLAY: Record<TabState, string> = {
  neutral: '',
  active: 'ring-2 ring-primary ring-offset-1',
  solved: 'ring-2 ring-status-green ring-offset-1',
  failed: 'ring-2 ring-status-red ring-offset-1',
  skipped: 'ring-2 ring-border ring-offset-1',
};

export default function ChallengeTabBar({ tabs, activeIndex, onSelect }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 w-full my-2">
      {tabs.map((tab) => {
        const Icon = ICONS[tab.type];
        const isActive = tab.index === activeIndex;
        const currentState: TabState = isActive ? 'active' : tab.state;

        return (
          <button
            key={tab.index}
            onClick={() => onSelect(tab.index)}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${STATE_STYLES[currentState]}`}
            aria-label={LABELS[tab.type]}
          >
            <div className={`relative w-14 h-10 rounded-md ${CLOUD_OVERLAY[currentState]}`}>
              <img
                src="/OrangeCloud.png"
                alt=""
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon
                  size={16}
                  className={
                    currentState === 'solved'
                      ? 'text-status-green'
                      : currentState === 'failed'
                      ? 'text-status-red'
                      : 'text-text-main'
                  }
                  style={{ marginTop: '-2px' }}
                />
              </div>
            </div>
            <span className="text-[11px] text-text-secondary font-medium">
              {LABELS[tab.type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
