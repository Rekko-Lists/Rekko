import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAnimes } from '@/lib/searchService';
import type { Anime } from '@/lib/searchService';
import { X } from 'lucide-react';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

interface Props {
  value: number | null;
  selectedName?: string;
  onSelect: (malId: number, name: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const styles = {
  container:      'relative w-full max-w-xs',
  selectedRow:    'flex items-center gap-2 h-[42px] border border-border rounded-btn px-3 bg-app-bg shadow-input',
  selectedCover:  'w-6 h-8 object-cover rounded-card flex-shrink-0',
  selectedName:   'flex-1 text-sm text-text-main truncate',
  clearBtn:       'flex-shrink-0 text-text-muted hover:text-status-red transition-colors',
  input:          'w-full h-[42px] border border-border rounded-btn px-3 bg-app-bg text-text-main text-sm placeholder:text-text-muted shadow-input focus:outline-none focus:border-primary transition-colors',
  dropdown:       'absolute top-full left-0 right-0 z-50 mt-1 bg-surface border border-border rounded-btn shadow-card max-h-52 overflow-y-auto',
  dropdownItem:   'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-app-bg transition-colors text-left cursor-pointer',
  itemCover:      'w-7 h-9 object-cover rounded-card flex-shrink-0',
  itemInfo:       'flex flex-col min-w-0',
  itemName:       'text-sm text-text-main leading-tight line-clamp-1',
  itemId:         'text-[11px] text-text-muted mt-0.5',
  loadingRow:     'px-3 py-2.5 text-sm text-text-muted',
};

export default function AnimeSearchSelect({
  value,
  selectedName,
  onSelect,
  onClear,
  placeholder = 'Buscar anime por nombre...',
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const animes = await searchAnimes(q.trim(), abortRef.current.signal);
      setResults(animes);
      setOpen(animes.length > 0);
    } catch (err: unknown) {
      const isAbort =
        (err as { name?: string })?.name === 'AbortError' ||
        (err as { code?: string })?.code === 'ERR_CANCELED' ||
        (err as { name?: string })?.name === 'CanceledError';
      if (!isAbort) { setResults([]); setOpen(false); }
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

  function handleSelect(anime: Anime) {
    onSelect(anime.malId, anime.name);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    onClear();
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  // If an anime is already selected, show a "chip" instead of the search input
  if (value && selectedName) {
    return (
      <div className={styles.container} ref={containerRef}>
        <div className={styles.selectedRow}>
          <span className={styles.selectedName}>{selectedName}</span>
          <span className="text-[11px] text-text-muted flex-shrink-0">MAL {value}</span>
          <button type="button" onClick={handleClear} className={styles.clearBtn} title="Cambiar anime">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={styles.input}
        autoComplete="off"
      />

      {open && (
        <div className={styles.dropdown}>
          {loading && <div className={styles.loadingRow}>Buscando...</div>}
          {!loading && results.map((anime) => (
            <button
              key={anime.malId}
              type="button"
              className={styles.dropdownItem}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(anime); }}
            >
              {anime.imgMedium && (
                <img src={anime.imgMedium} alt="" className={styles.itemCover} />
              )}
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{anime.name}</span>
                <span className={styles.itemId}>MAL ID: {anime.malId}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
