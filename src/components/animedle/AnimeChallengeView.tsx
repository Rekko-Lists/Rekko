import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { getUrl } from '@/types/challenge';

interface Props {
  data: {
    hard?: { url: string; publicId: string } | string;
    medium?: { url: string; publicId: string } | string;
    easy?: { url: string; publicId: string } | string;
    veryEasy?: { url: string; publicId: string } | string;
  };
  wrongGuesses: number;
  currentPhotoIndex: number;
  onPhotoIndexChange: (index: number) => void;
}

const PHOTO_ORDER = ['hard', 'medium', 'easy', 'veryEasy'] as const;

const DIFFICULTY_LABELS = ['HARD', 'MEDIUM', 'EASY', 'VERY EASY'];

const DIFFICULTY_COLORS = [
  'bg-status-red/90 text-white',
  'bg-primary/90 text-white',
  'bg-status-green/90 text-white',
  'bg-status-blue/90 text-white',
];

const styles = {
  wrapper:    'flex flex-col h-full relative z-10',
  imageBox:   'flex-1 overflow-hidden relative min-h-0',
  image:      'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
  noImage:    'absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 text-sm bg-black/20',
  // Nav bar at the bottom — stays in the dark area
  navBar:     'flex items-center justify-between px-4 py-2.5 bg-black/50 backdrop-blur-sm flex-shrink-0',
  navBtn:     'flex items-center gap-1.5 px-4 py-1.5 rounded-btn bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none',
  navCenter:  'flex flex-col items-center gap-0.5',
  diffBadge:  'text-xs font-bold px-3 py-0.5 rounded-pill',
  photoCount: 'text-[11px] text-white/55',
};

export default function AnimeChallengeView({
  data,
  wrongGuesses,
  currentPhotoIndex,
  onPhotoIndexChange,
}: Props) {
  const [imgError, setImgError] = useState(false);

  // Photos unlocked by wrong guesses: at least 1, +1 per wrong guess, max 4
  const unlockedCount = Math.min(wrongGuesses + 1, 4);
  const safeIndex = Math.min(currentPhotoIndex, unlockedCount - 1);

  const currentKey = PHOTO_ORDER[safeIndex];
  const imageUrl = getUrl(data[currentKey]);

  // Reset error state when the photo changes
  function handleIndexChange(idx: number) {
    setImgError(false);
    onPhotoIndexChange(idx);
  }

  function goPrev() {
    if (safeIndex > 0) handleIndexChange(safeIndex - 1);
  }

  function goNext() {
    if (safeIndex < unlockedCount - 1) handleIndexChange(safeIndex + 1);
  }

  const canGoPrev = safeIndex > 0;
  const canGoNext = safeIndex < unlockedCount - 1;

  return (
    <div className={styles.wrapper}>
      {/* Photo */}
      <div className={styles.imageBox}>
        {imageUrl && !imgError ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Hint ${safeIndex + 1}`}
            className={styles.image}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.noImage}>
            <ImageOff size={28} className="opacity-60" />
            <span>{imgError ? 'Error loading image' : 'No image'}</span>
            {import.meta.env.DEV && !imageUrl && (
              <span className="text-[10px] opacity-50 px-2 text-center break-all">
                key: {currentKey} | url: {String(imageUrl || 'empty')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation bar — arrows + difficulty label between them */}
      <div className={styles.navBar}>
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className={styles.navBtn}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className={styles.navCenter}>
          <span className={`${styles.diffBadge} ${DIFFICULTY_COLORS[safeIndex]}`}>
            {DIFFICULTY_LABELS[safeIndex]}
          </span>
          <span className={styles.photoCount}>
            {safeIndex + 1} / {unlockedCount}
          </span>
        </div>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          className={styles.navBtn}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
