import { ChevronLeft, ChevronRight } from 'lucide-react';

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

function getUrl(field: { url: string; publicId: string } | string | undefined): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.url;
}

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
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {/* Difficulty badge + counter */}
      <div className="flex items-center justify-between w-full px-1">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-pill ${DIFFICULTY_COLORS[safeIndex]}`}
        >
          {DIFFICULTY_LABELS[safeIndex]}
        </span>
        <span className="text-xs text-text-muted font-medium">
          {safeIndex + 1}/{unlockedCount} foto{unlockedCount !== 1 ? 's' : ''} desbloqueada{unlockedCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Image */}
      <div className="w-full flex-1 overflow-hidden rounded-card bg-black flex items-center justify-center min-h-0">
        {imageUrl ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Pista ${safeIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
            Sin imagen
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {unlockedCount > 1 && (
        <div className="flex items-center gap-4">
          <button
            onClick={goPrev}
            disabled={safeIndex === 0}
            className="flex items-center gap-1 px-4 py-1.5 rounded-btn bg-gradient-cta text-white text-sm disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span className="text-xs text-text-muted">
            {safeIndex + 1} / {unlockedCount}
          </span>
          <button
            onClick={goNext}
            disabled={safeIndex >= unlockedCount - 1}
            className="flex items-center gap-1 px-4 py-1.5 rounded-btn bg-gradient-cta text-white text-sm disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
