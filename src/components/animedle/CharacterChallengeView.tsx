import { getUrl } from '@/types/challenge';

interface Props {
  data: {
    character?: { url: string; publicId: string } | string;
  };
  wrongGuesses: number;
}

const styles = {
  wrapper: 'flex flex-col items-center justify-center h-full gap-3 relative z-10',
  imageBox: 'w-full h-full overflow-hidden flex items-center justify-center',
  image: 'w-full h-full object-cover transition-all duration-700',
  noImage: 'text-sm text-white/50 italic',
  hint: 'text-xs text-white/60 pb-1',
};

export default function CharacterChallengeView({ data, wrongGuesses }: Props) {
  const imageUrl = getUrl(data.character);
  // Start at blur(24px), reduce by 6px per wrong guess, minimum 0px
  const blurPx = Math.max(0, 24 - wrongGuesses * 6);

  return (
    <div className={styles.wrapper}>
      {imageUrl ? (
        <div className={styles.imageBox}>
          <img
            src={imageUrl}
            alt="Personaje misterioso"
            className={styles.image}
            style={{ filter: `blur(${blurPx}px)` }}
          />
        </div>
      ) : (
        <p className={styles.noImage}>Imagen no disponible</p>
      )}
      <p className={styles.hint}>
        {blurPx > 0 ? `Desenfoque: ${blurPx}px — sigue intentando` : 'Imagen revelada'}
      </p>
    </div>
  );
}
