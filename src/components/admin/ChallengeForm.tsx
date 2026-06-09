import { useState } from 'react';
import api from '@/lib/api';
import { extractApiError } from '@/lib/apiErrors';
import Spinner from '@/components/ui/common/Spinner';

type ChallengeType = 'anime' | 'character' | 'opening' | 'emoji';

interface ChallengeResponseDTO {
  type: ChallengeType;
  anime: { malId: number; name: string; imgMedium?: string; imgLarge?: string };
  data: Record<string, unknown>;
}

interface ChallengeFormProps {
  date: string;
  onSuccess: () => void;
  initialData?: ChallengeResponseDTO;
  challengeId?: number;
  challengeIndex?: number;
}

const styles = {
  form:          'flex flex-col gap-5 p-6 border border-border rounded-card bg-surface shadow-card',
  formTitle:     'text-lg font-semibold text-text-main leading-none',
  divider:       'border-t border-border-light',
  fieldGroup:    'flex flex-col gap-1.5',
  label:         'text-sm font-medium text-text-main',
  labelBlock:    'text-sm font-medium text-text-main block mb-1',
  labelMuted:    'text-text-muted text-xs ml-1',
  select:        'border border-border rounded-btn px-3 h-[42px] bg-app-bg text-text-main text-sm focus:outline-none focus:border-primary transition-colors w-full max-w-xs shadow-input',
  input:         'border border-border rounded-btn px-3 h-[42px] bg-app-bg text-text-main text-sm focus:outline-none focus:border-primary transition-colors w-full max-w-xs shadow-input',
  fileInput:     'border border-border rounded-btn px-3 py-2 bg-app-bg text-sm text-text-secondary w-full max-w-xs file:mr-3 file:text-sm file:rounded-btn file:border-0 file:bg-primary/10 file:text-primary file:px-3 file:py-1.5 file:font-medium hover:file:bg-primary/20',
  emojiRow:      'flex items-center gap-2',
  emojiLabel:    'text-sm font-medium text-text-main w-16',
  emojiInput:    'w-12 h-12 border border-border rounded-btn text-center text-2xl bg-app-bg focus:outline-none focus:border-primary shadow-input',
  animeSection:  'flex flex-col gap-4',
  openingSection:'flex flex-col gap-4',
  emojiSection:  'flex flex-col gap-2',
  fileBlock:     'flex flex-col gap-1',
  alertError:    'rounded-card border border-status-red/30 bg-status-red/5 px-4 py-3 text-sm text-status-red',
  submitRow:     'flex gap-2 pt-1',
  btnCta:        'inline-flex items-center gap-2 bg-gradient-to-b from-grad-start to-grad-end text-white px-5 h-[42px] rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60',
};

export default function ChallengeForm({
  date,
  onSuccess,
  initialData,
  challengeId,
  challengeIndex = 0,
}: ChallengeFormProps) {
  const isEdit = challengeId !== undefined;

  const [type, setType] = useState<ChallengeType>(initialData?.type ?? 'anime');
  const [malId, setMalId] = useState<number>(initialData?.anime?.malId ?? 0);

  // Anime fields
  const [fileHard, setFileHard] = useState<File | null>(null);
  const [fileMedium, setFileMedium] = useState<File | null>(null);
  const [fileEasy, setFileEasy] = useState<File | null>(null);
  const [fileVeryEasy, setFileVeryEasy] = useState<File | null>(null);

  // Character fields
  const [fileCharacter, setFileCharacter] = useState<File | null>(null);

  // Opening fields
  const [mediaType, setMediaType] = useState<'opening' | 'ending'>('opening');
  const [fileOpening, setFileOpening] = useState<File | null>(null);

  // Emoji fields
  const [emojis, setEmojis] = useState<string[]>([
    String((initialData?.data as Record<string, string>)?.emoji1 ?? ''),
    String((initialData?.data as Record<string, string>)?.emoji2 ?? ''),
    String((initialData?.data as Record<string, string>)?.emoji3 ?? ''),
    String((initialData?.data as Record<string, string>)?.emoji4 ?? ''),
    String((initialData?.data as Record<string, string>)?.emoji5 ?? ''),
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildEmojiData(): Record<string, string> {
    return {
      emoji1: emojis[0],
      emoji2: emojis[1],
      emoji3: emojis[2],
      emoji4: emojis[3],
      emoji5: emojis[4],
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const idx = challengeIndex;
      const challengePayload = {
        date,
        challenges: [
          {
            type,
            malId,
            ...(type === 'emoji' ? { data: buildEmojiData() } : {}),
            ...(type === 'opening' ? { data: { mediaType } } : {}),
          },
        ],
      };

      const formData = new FormData();
      formData.append('challenges', JSON.stringify(challengePayload));

      if (type === 'anime') {
        if (fileHard) formData.append(`challenge_${idx}_hard`, fileHard);
        if (fileMedium) formData.append(`challenge_${idx}_medium`, fileMedium);
        if (fileEasy) formData.append(`challenge_${idx}_easy`, fileEasy);
        if (fileVeryEasy) formData.append(`challenge_${idx}_veryEasy`, fileVeryEasy);
      } else if (type === 'character') {
        if (fileCharacter) formData.append(`challenge_${idx}_character`, fileCharacter);
      } else if (type === 'opening') {
        if (fileOpening) formData.append(`challenge_${idx}_opening`, fileOpening);
      }

      if (isEdit) {
        await api.patch(`/challenges/${challengeId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/challenges', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSuccess();
    } catch (e: unknown) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.formTitle}>
        {isEdit ? 'Editar challenge' : 'Nuevo challenge'}
      </h3>

      <div className={styles.divider} />

      {/* Type selector */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Tipo</label>
        <select
          className={styles.select}
          value={type}
          onChange={e => setType(e.target.value as ChallengeType)}
          disabled={isEdit}
        >
          <option value="anime">Anime</option>
          <option value="character">Personaje</option>
          <option value="opening">Opening / Ending</option>
          <option value="emoji">Emoji</option>
        </select>
      </div>

      {/* MAL ID */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>MAL ID</label>
        <input
          type="number"
          min={1}
          required
          value={malId || ''}
          onChange={e => setMalId(Number(e.target.value))}
          className={styles.input}
          placeholder="Ej: 1535"
        />
      </div>

      {/* Dynamic fields by type */}
      {type === 'anime' && (
        <div className={styles.animeSection}>
          <div className={styles.fileBlock}>
            <label className={styles.labelBlock}>
              Foto difícil <span className={styles.labelMuted}>(se muestra 1ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileHard(e.target.files?.[0] ?? null)}
              className={styles.fileInput}
            />
          </div>
          <div className={styles.fileBlock}>
            <label className={styles.labelBlock}>
              Foto media <span className={styles.labelMuted}>(se muestra 2ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileMedium(e.target.files?.[0] ?? null)}
              className={styles.fileInput}
            />
          </div>
          <div className={styles.fileBlock}>
            <label className={styles.labelBlock}>
              Foto fácil <span className={styles.labelMuted}>(se muestra 3ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileEasy(e.target.files?.[0] ?? null)}
              className={styles.fileInput}
            />
          </div>
          <div className={styles.fileBlock}>
            <label className={styles.labelBlock}>
              Foto muy fácil <span className={styles.labelMuted}>(se muestra 4ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileVeryEasy(e.target.files?.[0] ?? null)}
              className={styles.fileInput}
            />
          </div>
        </div>
      )}

      {type === 'character' && (
        <div className={styles.fileBlock}>
          <label className={styles.labelBlock}>Foto del personaje</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFileCharacter(e.target.files?.[0] ?? null)}
            className={styles.fileInput}
          />
        </div>
      )}

      {type === 'opening' && (
        <div className={styles.openingSection}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Tipo de media</label>
            <select
              className={styles.select}
              value={mediaType}
              onChange={e => setMediaType(e.target.value as 'opening' | 'ending')}
            >
              <option value="opening">Opening</option>
              <option value="ending">Ending</option>
            </select>
          </div>
          <div className={styles.fileBlock}>
            <label className={styles.labelBlock}>Audio del opening/ending</label>
            <input
              type="file"
              accept="audio/*"
              onChange={e => setFileOpening(e.target.files?.[0] ?? null)}
              className={styles.fileInput}
            />
          </div>
        </div>
      )}

      {type === 'emoji' && (
        <div className={styles.emojiSection}>
          {emojis.map((emoji, i) => (
            <div key={i} className={styles.emojiRow}>
              <label className={styles.emojiLabel}>Emoji {i + 1}</label>
              <input
                type="text"
                value={emoji}
                onChange={e => {
                  const updated = [...emojis];
                  updated[i] = e.target.value;
                  setEmojis(updated);
                }}
                className={styles.emojiInput}
                maxLength={8}
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className={styles.alertError}>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.submitRow}>
        <button type="submit" disabled={loading} className={styles.btnCta}>
          {loading && <Spinner size="sm" variant="white" className="mr-1" />}
          {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
