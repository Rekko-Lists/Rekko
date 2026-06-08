import { useState } from 'react';
import api from '@/lib/api';
import { extractApiError } from '@/lib/apiErrors';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-surface">
      <h3 className="font-semibold text-text-main font-gabarito">
        {isEdit ? 'Editar challenge' : 'Nuevo challenge'}
      </h3>

      {/* Type selector */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-main">Tipo</label>
        <select
          className="select select-bordered w-full max-w-xs"
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
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-main">MAL ID</label>
        <input
          type="number"
          min={1}
          required
          value={malId || ''}
          onChange={e => setMalId(Number(e.target.value))}
          className="input input-bordered w-full max-w-xs"
          placeholder="Ej: 1535"
        />
      </div>

      {/* Dynamic fields by type */}
      {type === 'anime' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-text-main block mb-1">
              Foto difícil <span className="text-text-muted text-xs">(se muestra 1ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileHard(e.target.files?.[0] ?? null)}
              className="file-input file-input-bordered w-full max-w-xs"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-main block mb-1">
              Foto media <span className="text-text-muted text-xs">(se muestra 2ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileMedium(e.target.files?.[0] ?? null)}
              className="file-input file-input-bordered w-full max-w-xs"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-main block mb-1">
              Foto fácil <span className="text-text-muted text-xs">(se muestra 3ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileEasy(e.target.files?.[0] ?? null)}
              className="file-input file-input-bordered w-full max-w-xs"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-main block mb-1">
              Foto muy fácil <span className="text-text-muted text-xs">(se muestra 4ª)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFileVeryEasy(e.target.files?.[0] ?? null)}
              className="file-input file-input-bordered w-full max-w-xs"
            />
          </div>
        </div>
      )}

      {type === 'character' && (
        <div>
          <label className="text-sm font-medium text-text-main block mb-1">Foto del personaje</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFileCharacter(e.target.files?.[0] ?? null)}
            className="file-input file-input-bordered w-full max-w-xs"
          />
        </div>
      )}

      {type === 'opening' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-main">Tipo de media</label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={mediaType}
              onChange={e => setMediaType(e.target.value as 'opening' | 'ending')}
            >
              <option value="opening">Opening</option>
              <option value="ending">Ending</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-text-main block mb-1">Audio del opening/ending</label>
            <input
              type="file"
              accept="audio/*"
              onChange={e => setFileOpening(e.target.files?.[0] ?? null)}
              className="file-input file-input-bordered w-full max-w-xs"
            />
          </div>
        </div>
      )}

      {type === 'emoji' && (
        <div className="flex flex-col gap-2">
          {emojis.map((emoji, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-main w-16">Emoji {i + 1}</label>
              <input
                type="text"
                value={emoji}
                onChange={e => {
                  const updated = [...emojis];
                  updated[i] = e.target.value;
                  setEmojis(updated);
                }}
                className="input input-bordered w-24 text-center text-xl"
                placeholder="😀"
                maxLength={8}
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading && <span className="loading loading-spinner loading-sm mr-1" />}
          {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
