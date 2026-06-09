import { getUrl } from '@/types/challenge';

interface Props {
  data: {
    character?: { url: string; publicId: string } | string;
  };
  wrongGuesses: number;
}

export default function CharacterChallengeView({ data, wrongGuesses }: Props) {
  const imageUrl = getUrl(data.character);
  // Start at blur(24px), reduce by 6px per wrong guess, minimum 0px
  const blurPx = Math.max(0, 24 - wrongGuesses * 6);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      {imageUrl ? (
        <div className="w-full h-full overflow-hidden rounded-card flex items-center justify-center bg-black">
          <img
            src={imageUrl}
            alt="Personaje misterioso"
            className="w-full h-full object-cover transition-all duration-700"
            style={{ filter: `blur(${blurPx}px)` }}
          />
        </div>
      ) : (
        <p className="text-sm text-text-muted italic">Imagen no disponible</p>
      )}
      <p className="text-xs text-text-muted">
        {blurPx > 0 ? `Desenfoque: ${blurPx}px — sigue intentando` : 'Imagen revelada'}
      </p>
    </div>
  );
}
