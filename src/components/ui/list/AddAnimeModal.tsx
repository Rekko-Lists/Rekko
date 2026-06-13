import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Check, Search, ArrowLeft, Star, Plus } from 'lucide-react';
import { searchAnimes, type Anime } from '@/lib/searchService';
import type { WatchState } from '@/types/anime';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 3;

const STATE_OPTIONS: { value: WatchState; label: string; activeClass: string }[] = [
  { value: 'WATCHING',      label: 'Watching',      activeClass: 'border-status-blue text-status-blue bg-status-blue/10'   },
  { value: 'COMPLETED',     label: 'Completed',     activeClass: 'border-status-green text-status-green bg-status-green/10' },
  { value: 'ON_HOLD',       label: 'On Hold',       activeClass: 'border-primary text-primary bg-primary/10'              },
  { value: 'DROPPED',       label: 'Dropped',       activeClass: 'border-status-red text-status-red bg-status-red/10'      },
  { value: 'PLAN_TO_WATCH', label: 'Plan to Watch', activeClass: 'border-[#888] text-[#888] bg-black/5'                   },
];

const styles = {
  backdrop:     'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
  panel:        'bg-white rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] w-full max-w-md font-gabarito overflow-hidden flex flex-col max-h-[85vh]',
  header:       'flex items-center gap-3 p-5 border-b border-border-light',
  headerTitle:  'flex-1 text-base font-semibold text-text-main',
  closeBtn:     'w-7 h-7 rounded-full hover:bg-border flex items-center justify-center transition-colors flex-shrink-0',
  closeIcon:    'text-text-secondary',
  searchWrap:   'relative px-5 pt-4',
  searchIcon:   'absolute left-8 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none',
  searchInput:  'w-full h-[42px] border border-border rounded-btn pl-10 pr-3 bg-app-bg text-text-main text-sm placeholder:text-text-muted shadow-input focus:outline-none focus:border-primary transition-colors',
  results:      'flex-1 overflow-y-auto px-5 py-3 space-y-1.5 min-h-[120px]',
  resultRow:    'w-full flex items-center gap-3 p-2 rounded-[8px] hover:bg-app-bg transition-colors text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
  resultCover:  'w-[42px] h-[56px] rounded-[4px] object-cover flex-shrink-0 bg-gradient-to-br from-slate-600 to-slate-900',
  resultInfo:   'flex-1 min-w-0',
  resultName:   'text-sm font-medium text-text-main leading-tight line-clamp-1',
  resultMeta:   'text-[11px] text-text-secondary mt-0.5 flex items-center gap-2 flex-wrap',
  metaScore:    'flex items-center gap-0.5 text-primary',
  addedBadge:   'text-[10px] font-semibold text-status-green flex items-center gap-0.5',
  stateRow:     'flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary flex-shrink-0',
  emptyState:   'text-center text-sm text-text-muted py-8',
  // confirm view
  confirmHead:  'flex items-start gap-3 p-5 border-b border-border-light',
  confirmCover: 'w-[52px] h-[68px] rounded-[4px] overflow-hidden bg-gradient-to-br from-slate-600 to-slate-900 flex-shrink-0',
  confirmImg:   'w-full h-full object-cover',
  confirmInfo:  'flex-1 min-w-0',
  confirmTitle: 'text-base font-semibold text-text-main leading-tight line-clamp-2',
  confirmType:  'text-xs text-text-secondary mt-0.5 capitalize',
  body:         'p-5 space-y-5',
  sectionLabel: 'text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block',
  stateGrid:    'flex flex-wrap gap-2',
  stateBtnBase: 'text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
  stateBtnIdle: 'border-border text-text-secondary hover:border-primary hover:text-primary',
  checkIcon:    'inline mr-1',
  footer:       'flex items-center justify-end gap-2 p-4 border-t border-border-light bg-app-bg',
  backBtn:      'flex items-center gap-1 text-xs text-text-secondary hover:text-text-main px-3 py-2 rounded-[6px] border border-border hover:border-primary transition-colors mr-auto',
  addBtn:       'flex items-center gap-1 text-xs font-semibold text-white bg-gradient-to-b from-grad-start to-grad-end px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity disabled:opacity-50',
};

function yearOf(anime: Anime): string | null {
  if (anime.premieredYear) return String(anime.premieredYear);
  if (anime.startDate) {
    const y = new Date(anime.startDate).getFullYear();
    if (!Number.isNaN(y)) return String(y);
  }
  return null;
}

interface Props {
  onClose: () => void;
  onAdd: (malId: number, state: WatchState, numEpisodes: number) => Promise<void>;
  existingMalIds: Set<number>;
}

export default function AddAnimeModal({ onClose, onAdd, existingMalIds }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Anime | null>(null);
  const [selectedState, setSelectedState] = useState<WatchState>('PLAN_TO_WATCH');
  const [adding, setAdding] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < MIN_CHARS) {
      setResults([]);
      setSearched(false);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const animes = await searchAnimes(q.trim(), abortRef.current.signal);
      setResults(animes);
      setSearched(true);
    } catch (err: unknown) {
      const isAbort =
        (err as { name?: string })?.name === 'AbortError' ||
        (err as { code?: string })?.code === 'ERR_CANCELED' ||
        (err as { name?: string })?.name === 'CanceledError';
      if (!isAbort) { setResults([]); setSearched(true); }
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void runSearch(q), DEBOUNCE_MS);
  }

  async function handleAdd() {
    if (!selected) return;
    setAdding(true);
    try {
      // Completed entries default to the full episode count; everything else
      // starts at 0 — the user can fine-tune later from the edit modal.
      const episodes = selectedState === 'COMPLETED' ? selected.numEpisodes : 0;
      await onAdd(selected.malId, selectedState, episodes);
      onClose();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.panel}>
        {selected ? (
          <>
            <div className={styles.confirmHead}>
              <div className={styles.confirmCover}>
                {selected.imgMedium && (
                  <img src={selected.imgMedium} alt={selected.name} className={styles.confirmImg} />
                )}
              </div>
              <div className={styles.confirmInfo}>
                <h2 className={styles.confirmTitle}>{selected.name}</h2>
                <p className={styles.confirmType}>
                  {[yearOf(selected), selected.numEpisodes > 0 ? `${selected.numEpisodes} ep` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={14} className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.body}>
              <div>
                <label className={styles.sectionLabel}>Add as</label>
                <div className={styles.stateGrid}>
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
            </div>

            <div className={styles.footer}>
              <button onClick={() => setSelected(null)} className={styles.backBtn}>
                <ArrowLeft size={13} />
                Back
              </button>
              <button onClick={handleAdd} disabled={adding} className={styles.addBtn}>
                <Plus size={13} />
                {adding ? 'Adding…' : 'Add to list'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.headerTitle}>Add anime</h2>
              <button onClick={onClose} className={styles.closeBtn}>
                <X size={14} className={styles.closeIcon} />
              </button>
            </div>

            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search an anime by name…"
                className={styles.searchInput}
                autoFocus
                autoComplete="off"
              />
            </div>

            <div className={styles.results}>
              {loading && <p className={styles.emptyState}>Searching…</p>}
              {!loading && searched && results.length === 0 && (
                <p className={styles.emptyState}>No animes found.</p>
              )}
              {!loading && !searched && (
                <p className={styles.emptyState}>Type at least {MIN_CHARS} characters to search.</p>
              )}
              {!loading && results.map((anime) => {
                const already = existingMalIds.has(anime.malId);
                const year = yearOf(anime);
                return (
                  <button
                    key={anime.malId}
                    type="button"
                    className={styles.resultRow}
                    disabled={already}
                    onClick={() => setSelected(anime)}
                  >
                    <img src={anime.imgMedium} alt="" className={styles.resultCover} />
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{anime.name}</span>
                      <span className={styles.resultMeta}>
                        {anime.malMean > 0 && (
                          <span className={styles.metaScore}>
                            <Star size={10} fill="#FF9E00" className="text-primary" />
                            {anime.malMean.toFixed(2)}
                          </span>
                        )}
                        {year && <span>{year}</span>}
                        {anime.numEpisodes > 0 && <span>{anime.numEpisodes} ep</span>}
                        {anime.status === 'currently_airing' && <span>Airing</span>}
                      </span>
                    </div>
                    {already ? (
                      <span className={styles.addedBadge}>
                        <Check size={12} />
                        In list
                      </span>
                    ) : (
                      <span className={styles.stateRow}>
                        <Plus size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
