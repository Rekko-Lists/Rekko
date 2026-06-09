import { ChevronLeft, ChevronRight } from 'lucide-react';
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
const DIFFICULTY_LABELS = ['DIFÍCIL', 'MEDIA', 'FÁCIL', 'MUY FÁCIL'];
const DIFFICULTY_COLORS = [
  'bg-status-red text-white',
  'bg-primary text-white',
  'bg-status-green text-white',
  'bg-status-blue text-white',
];

const styles = {
  wrapper: 'flex flex-col items-center justify-center h-full gap-3 relative z-10',
  topRow: 'flex items-center justify-between w-full px-3',
  difficultyBadge: 'text-xs font-bold px-3 py-1 rounded-pill',
  photoCounter: 'text-xs text-white/70 font-medium',
  imageBox: 'w-full flex-1 overflow-hidden flex items-center justify-center min-h-0',
  image: 'w-full h-full object-cover transition-opacity duration-300',
  noImage: 'w-full h-full flex items-center justify-center text-white/50 text-sm',
  navRow: 'flex items-center gap-4 pb-1',
  navBtn: 'flex items-center gap-1 px-4 py-1.5 rounded-btn bg-gradient-cta text-white text-sm disabled:opacity-30 hover:opacity-90 transition-opacity',
  navCounter: 'text-xs text-white/60',
};

export default function AnimeChallengeView({
  data,
  wrongGuesses,
  currentPhotoIndex,
  onPhotoIndexChange,
}: Props) {
  // How many photos are unlocked: at least 1 (the hard one), plus one per wrong guess
  const unlockedCount = Math.min(wrongGuesses + 1, 4);
  const safeIndex = Math.min(currentPhotoIndex, unlockedCount - 1);

  const currentKey = PHOTO_ORDER[safeIndex];
  const imageUrl = getUrl(data[currentKey]);

  function goPrev() {
    if (safeIndex > 0) onPhotoIndexChange(safeIndex - 1);
  }

  function goNext() {
    if (safeIndex < unlockedCount - 1) onPhotoIndexChange(safeIndex + 1);
  }

  return (
    <div className={styles.wrapper}>
      {/* Difficulty badge + photo counter */}
      <div className={styles.topRow}>
        <span className={`${styles.difficultyBadge} ${DIFFICULTY_COLORS[safeIndex]}`}>
          {DIFFICULTY_LABELS[safeIndex]}
        </span>
        <span className={styles.photoCounter}>
          {safeIndex + 1}/{unlockedCount} foto{unlockedCount !== 1 ? 's' : ''} desbloqueada{unlockedCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Image */}
      <div className={styles.imageBox}>
        {imageUrl ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Pista ${safeIndex + 1}`}
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage}>Sin imagen</div>
        )}
      </div>

      {/* Navigation arrows */}
      {unlockedCount > 1 && (
        <div className={styles.navRow}>
          <button
            onClick={goPrev}
            disabled={safeIndex === 0}
            className={styles.navBtn}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className={styles.navCounter}>
            {safeIndex + 1} / {unlockedCount}
          </span>
          <button
            onClick={goNext}
            disabled={safeIndex >= unlockedCount - 1}
            className={styles.navBtn}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
