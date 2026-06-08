import { useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import ChallengeForm from './ChallengeForm';

type ChallengeType = 'anime' | 'character' | 'opening' | 'emoji';

interface ChallengeResponseDTO {
  challengeId: number;
  type: ChallengeType;
  anime: { malId: number; name: string; imgMedium?: string; imgLarge?: string };
  data: Record<string, unknown>;
}

const BASE = import.meta.env.VITE_API_BASE_URL as string;

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ChallengesPanel() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISODate());
  const [challenges, setChallenges] = useState<ChallengeResponseDTO[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadDone, setLoadDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // Which challenge is being edited (by challengeId)
  const [editingId, setEditingId] = useState<number | null>(null);
  // Whether the "Añadir challenge" form is open
  const [addingNew, setAddingNew] = useState(false);

  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function loadChallenges() {
    setLoading(true);
    setLoadError(null);
    setDeleteMsg(null);
    setEditingId(null);
    setAddingNew(false);
    try {
      const res = await axios.get<{
        success: boolean;
        data: { challenges: ChallengeResponseDTO[] };
      }>(`${BASE}/challenges/${selectedDate}`);
      setChallenges(res.data.data.challenges ?? []);
      setLoadDone(true);
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'response' in e &&
        (e as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
      ) {
        setLoadError((e as { response: { data: { error: { message: string } } } }).response.data.error.message);
      } else if (e instanceof Error) {
        setLoadError(e.message);
      } else {
        setLoadError('Error al cargar challenges');
      }
      setChallenges([]);
      setLoadDone(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm(`¿Seguro que quieres borrar todos los challenges del ${selectedDate}?`)) return;
    try {
      await api.delete(`/challenges/${selectedDate}`);
      setChallenges([]);
      setDeleteMsg('Challenges borrados correctamente.');
      setAddingNew(false);
      setEditingId(null);
    } catch (e: unknown) {
      if (
        e &&
        typeof e === 'object' &&
        'response' in e &&
        (e as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
      ) {
        setDeleteMsg('Error: ' + (e as { response: { data: { error: { message: string } } } }).response.data.error.message);
      } else if (e instanceof Error) {
        setDeleteMsg('Error: ' + e.message);
      } else {
        setDeleteMsg('Error desconocido al borrar');
      }
    }
  }

  function onFormSuccess() {
    setEditingId(null);
    setAddingNew(false);
    loadChallenges();
  }

  const typeLabels: Record<ChallengeType, string> = {
    anime: 'Anime',
    character: 'Personaje',
    opening: 'Opening/Ending',
    emoji: 'Emoji',
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-text-main font-gabarito mb-2">Challenges diarios</h2>
      <p className="text-text-muted mb-6">Gestiona los challenges de cada fecha.</p>

      {/* Date picker + load */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-text-main font-medium">Fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => {
            setSelectedDate(e.target.value);
            setLoadDone(false);
            setChallenges([]);
            setLoadError(null);
            setDeleteMsg(null);
          }}
          className="input input-bordered"
        />
        <button onClick={loadChallenges} disabled={loading} className="btn btn-primary">
          {loading && <span className="loading loading-spinner loading-sm mr-1" />}
          {loading ? 'Cargando...' : 'Cargar challenges'}
        </button>
      </div>

      {loadError && (
        <div className="alert alert-error mb-4">
          <span>{loadError}</span>
        </div>
      )}

      {deleteMsg && (
        <div className={`alert mb-4 ${deleteMsg.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>
          <span>{deleteMsg}</span>
        </div>
      )}

      {loadDone && (
        <>
          {/* Existing challenges */}
          {challenges.length > 0 && (
            <div className="flex flex-col gap-4 mb-6">
              {challenges.map((ch, idx) => (
                <div key={ch.challengeId ?? idx} className="border border-border rounded-lg p-4 bg-surface">
                  {editingId === ch.challengeId ? (
                    <div>
                      <ChallengeForm
                        date={selectedDate}
                        onSuccess={onFormSuccess}
                        initialData={ch}
                        challengeId={ch.challengeId}
                        challengeIndex={idx}
                      />
                      <button
                        className="btn btn-ghost btn-sm mt-2"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="badge badge-primary text-xs font-medium">
                          {typeLabels[ch.type]}
                        </span>
                        <span className="text-text-main text-sm font-medium">
                          {ch.anime?.name ?? `MAL ID: ${ch.anime?.malId}`}
                        </span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setAddingNew(false);
                          setEditingId(ch.challengeId);
                        }}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {challenges.length === 0 && !loadError && (
            <p className="text-text-muted mb-4">No hay challenges para esta fecha.</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {challenges.length < 4 && !addingNew && (
              <button
                className="btn btn-outline btn-primary"
                onClick={() => {
                  setEditingId(null);
                  setAddingNew(true);
                }}
              >
                + Añadir challenge
              </button>
            )}
            {challenges.length > 0 && (
              <button className="btn btn-error btn-outline" onClick={handleDeleteAll}>
                Borrar todos
              </button>
            )}
          </div>

          {/* New challenge form */}
          {addingNew && (
            <div>
              <ChallengeForm
                date={selectedDate}
                onSuccess={onFormSuccess}
                challengeIndex={challenges.length}
              />
              <button
                className="btn btn-ghost btn-sm mt-2"
                onClick={() => setAddingNew(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
