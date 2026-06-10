import { useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import Spinner from '@/components/ui/common/Spinner';
import ChallengeForm from './ChallengeForm';

type ChallengeType = 'anime' | 'character' | 'opening' | 'emoji';

interface ChallengeResponseDTO {
  challengeId: number;
  type: ChallengeType;
  anime: { malId: number; name: string; imgMedium?: string; imgLarge?: string };
  data: Record<string, unknown>;
}

const BASE = import.meta.env.VITE_API_BASE_URL as string;

function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = {
  root:           'px-4 py-6 max-w-3xl md:px-8 md:py-8',
  titleRow:       'flex items-baseline gap-3 mb-1',
  title:          'text-[32px] font-semibold text-text-main leading-none',
  titleDash:      'text-[24px] font-semibold text-text-secondary leading-none',
  description:    'text-sm text-text-muted mt-2 mb-6',
  dateRow:        'flex items-center gap-4 mb-6 flex-wrap',
  label:          'text-sm font-medium text-text-main',
  inputDate:      'border border-border rounded-btn px-3 h-[42px] bg-app-bg text-text-main text-sm focus:outline-none focus:border-primary transition-colors shadow-input',
  btnCta:         'inline-flex items-center gap-2 bg-gradient-to-b from-grad-start to-grad-end text-white px-5 h-[42px] rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60',
  alertError:     'mb-4 rounded-card border border-status-red/30 bg-status-red/5 px-4 py-3 text-sm text-status-red',
  alertSuccess:   'mb-4 rounded-card border border-status-green/30 bg-status-green/5 px-4 py-3 text-sm text-status-green',
  challengeList:  'flex flex-col gap-3 mb-6',
  challengeCard:  'border border-border rounded-card p-4 bg-surface shadow-card',
  challengeCardInner: 'flex items-center justify-between',
  challengeLeft:  'flex items-center gap-3',
  badge:          'bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-pill',
  challengeName:  'text-text-main text-sm font-medium',
  btnOutlineSm:   'border border-border text-text-secondary px-3 py-1.5 text-xs rounded-btn hover:border-primary hover:text-primary transition-colors',
  btnGhostSm:     'text-text-muted hover:text-text-main px-3 py-1.5 text-sm transition-colors rounded-btn mt-2',
  noChallenge:    'text-text-muted mb-4',
  actionsRow:     'flex gap-3 mb-6 flex-wrap',
  btnOutlinePrimary: 'inline-flex items-center gap-1.5 border border-primary text-primary px-4 h-[38px] rounded-btn text-sm font-medium hover:bg-primary/10 transition-colors',
  btnDanger:      'inline-flex items-center gap-1.5 border border-status-red text-status-red px-4 h-[38px] rounded-btn text-sm font-medium hover:bg-status-red/10 transition-colors',
};

const typeLabels: Record<ChallengeType, string> = {
  anime: 'Anime',
  character: 'Personaje',
  opening: 'Opening/Ending',
  emoji: 'Emoji',
};

export default function ChallengesPanel() {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
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

  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Challenges</h2>
        <span className={styles.titleDash}>— Diarios</span>
      </div>
      <p className={styles.description}>Gestiona los challenges de Animedle para cada fecha.</p>

      {/* Date picker + load */}
      <div className={styles.dateRow}>
        <label className={styles.label}>Fecha:</label>
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
          className={styles.inputDate}
        />
        <button onClick={loadChallenges} disabled={loading} className={styles.btnCta}>
          {loading && <Spinner size="sm" variant="white" className="mr-1" />}
          {loading ? 'Cargando...' : 'Cargar challenges'}
        </button>
      </div>

      {loadError && (
        <div className={styles.alertError}>
          <span>{loadError}</span>
        </div>
      )}

      {deleteMsg && (
        <div className={deleteMsg.startsWith('Error') ? styles.alertError : styles.alertSuccess}>
          <span>{deleteMsg}</span>
        </div>
      )}

      {loadDone && (
        <>
          {/* Existing challenges */}
          {challenges.length > 0 && (
            <div className={styles.challengeList}>
              {challenges.map((ch, idx) => (
                <div key={ch.challengeId ?? idx} className={styles.challengeCard}>
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
                        className={styles.btnGhostSm}
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className={styles.challengeCardInner}>
                      <div className={styles.challengeLeft}>
                        <span className={styles.badge}>
                          {typeLabels[ch.type]}
                        </span>
                        <span className={styles.challengeName}>
                          {ch.anime
                            ? (ch.anime.name ?? `MAL ID: ${ch.anime.malId}`)
                            : 'Sin anime'}
                        </span>
                      </div>
                      <button
                        className={styles.btnOutlineSm}
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
            <p className={styles.noChallenge}>No hay challenges para esta fecha.</p>
          )}

          {/* Actions */}
          <div className={styles.actionsRow}>
            {!addingNew && editingId === null && challenges.length < 4 && (
              <button
                className={styles.btnOutlinePrimary}
                onClick={() => {
                  setEditingId(null);
                  setAddingNew(true);
                }}
              >
                + Añadir challenge
              </button>
            )}
            {challenges.length > 0 && (
              <button className={styles.btnDanger} onClick={handleDeleteAll}>
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
                className={styles.btnGhostSm}
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
