import { ChevronDown, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  totalEpisodes: number;
  episodeProgress: number;
  rating: number;
  onEpisodesChange: (n: number) => void;
  onRatingChange: (n: number) => void;
  disabled?: boolean;
}

const styles = {
  wrap:        'flex items-center gap-2 font-gabarito',
  pill:        'flex items-center gap-1 h-[22px] bg-white border border-border rounded-[5px] px-2 text-[12px] text-text-main',
  pillLabel:   'text-text-muted text-[11px]',
  pillInput:   'w-[28px] text-primary text-[12px] font-semibold bg-transparent text-center focus:outline-none disabled:cursor-not-allowed',
  pillTotal:   'text-text-main text-[12px]',
  ratingPill:  'flex items-center gap-1 h-[22px] bg-white border border-border rounded-[5px] px-2 text-[12px] text-text-main relative',
  ratingSel:   'appearance-none bg-transparent text-[12px] text-text-main pr-3 focus:outline-none cursor-pointer disabled:cursor-not-allowed',
};

export default function EpisodeRatingInputs({
  totalEpisodes,
  episodeProgress,
  rating,
  onEpisodesChange,
  onRatingChange,
  disabled,
}: Props) {
  const [localEpisodes, setLocalEpisodes] = useState<string>(String(episodeProgress || 0));

  useEffect(() => {
    setLocalEpisodes(String(episodeProgress || 0));
  }, [episodeProgress]);

  const commitEpisodes = () => {
    const n = parseInt(localEpisodes, 10);
    if (!Number.isFinite(n) || n < 0) {
      setLocalEpisodes(String(episodeProgress || 0));
      return;
    }
    const clamped = totalEpisodes > 0 ? Math.min(n, totalEpisodes) : n;
    if (clamped !== episodeProgress) onEpisodesChange(clamped);
    setLocalEpisodes(String(clamped));
  };

  return (
    <div className={styles.wrap}>
      <label className={styles.pill}>
        <span className={styles.pillLabel}>Ep.</span>
        <input
          type="number"
          min={0}
          max={totalEpisodes > 0 ? totalEpisodes : undefined}
          value={localEpisodes}
          onChange={(e) => setLocalEpisodes(e.target.value)}
          onBlur={commitEpisodes}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
          }}
          className={styles.pillInput}
          disabled={disabled}
        />
        <span className={styles.pillTotal}>/ {totalEpisodes > 0 ? totalEpisodes : '?'}</span>
      </label>

      <label className={styles.ratingPill}>
        <Star size={12} fill="#FF9E00" className="text-primary" />
        <select
          value={rating || ''}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n)) onRatingChange(n);
          }}
          className={styles.ratingSel}
          disabled={disabled}
        >
          <option value="" disabled>Select</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <ChevronDown size={12} className="text-text-muted -ml-2 pointer-events-none" />
      </label>
    </div>
  );
}
