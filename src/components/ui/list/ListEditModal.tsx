import { useState } from 'react';
import { X, Star, Trash2, Check } from 'lucide-react';
import type { UserListEntry, ListState } from '@/hooks/useUserList';
import type { WatchState } from '@/types/anime';

const STATE_OPTIONS: { value: ListState; label: string; activeClass: string }[] = [
  { value: 'WATCHING',      label: 'Watching',       activeClass: 'border-status-blue text-status-blue bg-status-blue/10'   },
  { value: 'COMPLETED',     label: 'Completed',      activeClass: 'border-status-green text-status-green bg-status-green/10' },
  { value: 'ON_HOLD',       label: 'On Hold',        activeClass: 'border-primary text-primary bg-primary/10'              },
  { value: 'DROPPED',       label: 'Dropped',        activeClass: 'border-status-red text-status-red bg-status-red/10'      },
  { value: 'PLAN_TO_WATCH', label: 'Plan to Watch',  activeClass: 'border-[#888] text-[#888] bg-black/5'                   },
];

const styles = {
  backdrop:      'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
  panel:         'bg-white rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] w-full max-w-md font-gabarito overflow-hidden',
  header:        'flex items-start gap-3 p-5 border-b border-border-light',
  headerCover:   'w-[52px] h-[68px] rounded-[4px] overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900 flex-shrink-0',
  headerImg:     'w-full h-full object-cover',
  headerInfo:    'flex-1 min-w-0',
  headerTitle:   'text-base font-semibold text-text-main leading-tight line-clamp-2',
  headerType:    'text-xs text-text-secondary mt-0.5 capitalize',
  closeBtn:      'w-7 h-7 rounded-full hover:bg-border flex items-center justify-center transition-colors flex-shrink-0',
  closeIcon:     'text-text-secondary',
  body:          'p-5 space-y-5',
  sectionLabel:  'text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block',
  stateRow:      'flex flex-wrap gap-2',
  stateBtnBase:  'text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
  stateBtnIdle:  'border-border text-text-secondary hover:border-primary hover:text-primary',
  checkIcon:     'inline mr-1',
  episodeRow:    'flex items-center gap-3',
  episodeInput:  'w-20 h-9 text-center text-sm font-semibold border border-border rounded-[6px] focus:outline-none focus:border-primary bg-app-bg',
  episodeMeter:  'flex-1 space-y-1',
  episodeBar:    'h-[5px] rounded-full bg-border overflow-hidden',
  episodeFill:   'h-full bg-primary rounded-full transition-all',
  episodeCount:  'text-[11px] text-text-secondary text-right',
  starsRow:      'flex items-center gap-1.5',
  starClearBtn:  'text-xs px-2 py-1 rounded border transition-all',
  starClearActive:'border-primary text-primary bg-primary/10',
  starClearIdle: 'border-border text-text-secondary hover:border-primary',
  starBtn:       'group/star relative',
  starCount:     'text-sm font-semibold text-text-main ml-1',
  footer:        'flex items-center justify-between p-4 border-t border-border-light bg-app-bg',
  deleteConfirm: 'flex items-center gap-2',
  deleteWarn:    'text-xs text-status-red',
  deleteYes:     'text-xs font-semibold text-white bg-status-red px-3 py-1.5 rounded-[4px] hover:opacity-80 transition-opacity disabled:opacity-50',
  deleteCancel:  'text-xs text-text-secondary hover:text-text-main transition-colors',
  deleteBtn:     'flex items-center gap-1 text-xs text-text-secondary hover:text-status-red transition-colors',
  actionRow:     'flex items-center gap-2',
  cancelBtn:     'text-xs text-text-secondary hover:text-text-main px-4 py-2 rounded-[6px] border border-border hover:border-primary transition-colors',
  saveBtn:       'text-xs font-semibold text-white bg-gradient-to-b from-grad-start to-grad-end px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity disabled:opacity-50',
};

interface Props {
  entry: UserListEntry;
  onClose: () => void;
  onUpdateState: (malId: number, state: WatchState, episodes?: number) => Promise<void>;
  onUpdateRating: (malId: number, rating: number) => Promise<void>;
  onDelete: (malId: number, hasRating: boolean) => Promise<void>;
}

export default function ListEditModal({ entry, onClose, onUpdateState, onUpdateRating, onDelete }: Props) {
  const [selectedState, setSelectedState] = useState<ListState>(entry.state);
  const [episodes, setEpisodes] = useState(entry.numEpisodesWatched);
  const [rating, setRating] = useState<number>(entry.userRate ?? 0);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const episodePct = entry.numEpisodesTotal > 0
    ? (episodes / entry.numEpisodesTotal) * 100
    : 0;

  async function handleSave() {
    setSaving(true);
    try {
      if (selectedState !== entry.state || episodes !== entry.numEpisodesWatched) {
        await onUpdateState(entry.malId, selectedState as WatchState, episodes);
      }
      if (rating !== (entry.userRate ?? 0)) {
        await onUpdateRating(entry.malId, rating);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await onDelete(entry.malId, entry.userRate !== null);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerCover}>
            {entry.imgMedium && (
              <img src={entry.imgMedium} alt={entry.name} className={styles.headerImg} />
            )}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.headerTitle}>{entry.name}</h2>
            <p className={styles.headerType}>{entry.mediaType.replace(/_/g, ' ')}</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={14} className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.body}>
          <div>
            <label className={styles.sectionLabel}>Status</label>
            <div className={styles.stateRow}>
              {STATE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedState(opt.value)}
                  className={`${styles.stateBtnBase} ${
                    selectedState === opt.value ? opt.activeClass : styles.stateBtnIdle
                  }`}
                >
                  {selectedState === opt.value && <Check size={10} className={styles.checkIcon} />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {entry.numEpisodesTotal > 0 && (
            <div>
              <label className={styles.sectionLabel}>Episodes watched</label>
              <div className={styles.episodeRow}>
                <input
                  type="number"
                  min={0}
                  max={entry.numEpisodesTotal}
                  value={episodes}
                  onChange={(e) =>
                    setEpisodes(Math.min(entry.numEpisodesTotal, Math.max(0, parseInt(e.target.value) || 0)))
                  }
                  className={styles.episodeInput}
                />
                <div className={styles.episodeMeter}>
                  <div className={styles.episodeBar}>
                    <div className={styles.episodeFill} style={{ width: `${episodePct}%` }} />
                  </div>
                  <p className={styles.episodeCount}>{episodes}/{entry.numEpisodesTotal}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className={styles.sectionLabel}>Your rating</label>
            <div className={styles.starsRow}>
              <button
                onClick={() => setRating(0)}
                className={`${styles.starClearBtn} ${rating === 0 ? styles.starClearActive : styles.starClearIdle}`}
              >
                —
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button key={n} onClick={() => setRating(n)} className={styles.starBtn}>
                  <Star
                    size={20}
                    fill={n <= rating ? '#FF9E00' : 'none'}
                    className={n <= rating ? 'text-primary' : 'text-border group-hover/star:text-primary transition-colors'}
                  />
                </button>
              ))}
              {rating > 0 && <span className={styles.starCount}>{rating}/10</span>}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {confirmDelete ? (
            <div className={styles.deleteConfirm}>
              <span className={styles.deleteWarn}>Remove from list?</span>
              <button onClick={handleDelete} disabled={saving} className={styles.deleteYes}>
                Yes, remove
              </button>
              <button onClick={() => setConfirmDelete(false)} className={styles.deleteCancel}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className={styles.deleteBtn}>
              <Trash2 size={13} />
              Remove
            </button>
          )}
          <div className={styles.actionRow}>
            <button onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
