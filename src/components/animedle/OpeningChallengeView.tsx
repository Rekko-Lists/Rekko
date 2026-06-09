import { Music } from 'lucide-react';
import { getUrl } from '@/types/challenge';

interface Props {
  data: {
    mediaType?: 'opening' | 'ending';
    opening?: { url: string; publicId: string } | string;
  };
}

const styles = {
  wrapper: 'flex flex-col items-center justify-center h-full gap-5 relative z-10',
  labelRow: 'flex items-center gap-2 text-primary',
  labelText: 'text-lg font-bold uppercase tracking-wide',
  hint: 'text-sm text-white/60',
  audio: 'w-full max-w-[480px] rounded-btn',
  noAudio: 'text-sm text-white/50 italic',
};

export default function OpeningChallengeView({ data }: Props) {
  const audioUrl = getUrl(data.opening);
  const label = data.mediaType === 'ending' ? 'Ending' : 'Opening';

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <Music size={28} />
        <span className={styles.labelText}>{label}</span>
      </div>
      <p className={styles.hint}>
        Escucha el {label.toLowerCase()} e intenta adivinar el anime
      </p>
      {audioUrl ? (
        <audio controls src={audioUrl} className={styles.audio} />
      ) : (
        <p className={styles.noAudio}>Audio no disponible</p>
      )}
    </div>
  );
}
