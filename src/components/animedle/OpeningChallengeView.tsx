import { Music } from 'lucide-react';
import { getUrl } from '@/types/challenge';

interface Props {
  data: {
    mediaType?: 'opening' | 'ending';
    opening?: { url: string; publicId: string } | string;
  };
}

export default function OpeningChallengeView({ data }: Props) {
  const audioUrl = getUrl(data.opening);
  const label = data.mediaType === 'ending' ? 'Ending' : 'Opening';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="flex items-center gap-2 text-primary">
        <Music size={28} />
        <span className="text-lg font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm text-text-muted">
        Escucha el {label.toLowerCase()} e intenta adivinar el anime
      </p>
      {audioUrl ? (
        <audio
          controls
          src={audioUrl}
          className="w-full max-w-[480px] rounded-btn"
        />
      ) : (
        <p className="text-sm text-text-muted italic">Audio no disponible</p>
      )}
    </div>
  );
}
