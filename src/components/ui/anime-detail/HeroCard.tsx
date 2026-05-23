import { Check, Clock, Eye, MoreHorizontal, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WatchState } from '@/types/anime';

interface Props {
  imgLarge?: string;
  name: string;
  watchState: WatchState | null;
  onChangeState: (state: WatchState | null) => void;
  disabled?: boolean;
  disabledReason?: string;
}

interface StateOption {
  state: WatchState;
  bg: string;
  Icon: LucideIcon;
  label: string;
}

const STATE_OPTIONS: StateOption[] = [
  { state: 'COMPLETED',     bg: 'bg-[#4ebb22]', Icon: Check,          label: 'Completed' },
  { state: 'WATCHING',      bg: 'bg-[#e89308]', Icon: Eye,            label: 'Watching' },
  { state: 'DROPPED',       bg: 'bg-[#bb2222]', Icon: X,              label: 'Dropped' },
  { state: 'PLAN_TO_WATCH', bg: 'bg-[#2280bb]', Icon: MoreHorizontal, label: 'Plan to Watch' },
  { state: 'ON_HOLD',       bg: 'bg-[#e8c308]', Icon: Clock,          label: 'On Hold' },
];

const styles = {
  wrap:        'relative w-[209px] font-gabarito group',
  cover:       'w-[209px] h-[293px] rounded-tl-[5px] rounded-tr-[5px] overflow-hidden bg-gradient-to-br from-slate-500 to-slate-800 relative',
  coverImg:    'w-full h-full object-cover',
  overlay:     'absolute left-0 right-0 bottom-0 h-[24px] bg-[rgba(30,30,30,0.55)] border-2 border-[#e89308] rounded-tl-[5px] rounded-tr-[5px] flex items-center justify-around px-2 opacity-0 group-hover:opacity-100 transition-opacity',
  stateBtn:    'w-[17px] h-[17px] rounded-[5px] flex items-center justify-center text-white transition-transform hover:scale-110 disabled:cursor-not-allowed',
  stateActive: 'ring-2 ring-white scale-110',
  addBtn:      'w-full h-[31px] bg-primary hover:bg-primary-dark rounded-bl-[10px] rounded-br-[10px] text-white text-[20px] font-medium leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-70',
  inListBtn:   'w-full h-[31px] bg-[#788397] rounded-bl-[10px] rounded-br-[10px] text-white text-[14px] font-medium leading-none flex items-center justify-center gap-2',
};

export default function HeroCard({
  imgLarge,
  name,
  watchState,
  onChangeState,
  disabled,
  disabledReason,
}: Props) {
  const handleStateClick = (state: WatchState) => {
    if (disabled) return;
    // Toggle: clicking same state again removes it
    onChangeState(watchState === state ? null : state);
  };

  const activeLabel = STATE_OPTIONS.find((o) => o.state === watchState)?.label;

  return (
    <div className={styles.wrap}>
      <div className={styles.cover}>
        {imgLarge && <img src={imgLarge} alt={name} className={styles.coverImg} />}
        <div className={styles.overlay} role="group" aria-label="Watch state">
          {STATE_OPTIONS.map(({ state, bg, Icon, label }) => (
            <button
              key={state}
              type="button"
              className={`${styles.stateBtn} ${bg} ${watchState === state ? styles.stateActive : ''}`}
              onClick={() => handleStateClick(state)}
              disabled={disabled}
              title={disabled ? disabledReason : label}
              aria-label={label}
              aria-pressed={watchState === state}
            >
              <Icon size={12} strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </div>
      {watchState ? (
        <div className={styles.inListBtn} title={disabled ? disabledReason : undefined}>
          In your list — {activeLabel}
        </div>
      ) : (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => handleStateClick('PLAN_TO_WATCH')}
          disabled={disabled}
          title={disabled ? disabledReason : 'Add to your list'}
        >
          + Add List
        </button>
      )}
    </div>
  );
}
