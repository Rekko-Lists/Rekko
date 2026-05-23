import { Search } from 'lucide-react';
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';

interface Props {
  placeholder?: string;
  /** Controlled value. Si se omite, el componente gestiona su propio estado. */
  value?: string;
  /** Controlled change handler. Requerido si `value` viene de fuera. */
  onChange?: (value: string) => void;
}

const MAX_DROPDOWN_RESULTS = 5;

const styles = {
  wrapper:   'relative w-[380px] font-gabarito',
  form:      'relative',
  input:     'w-full h-[40px] pl-4 pr-10 bg-[rgba(246,246,246,0.6)] border-[1.5px] border-border rounded-pill text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors',
  icon:      'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted',
  dropdown:  'absolute left-0 right-0 top-[44px] bg-surface border border-border rounded-card shadow-card z-50 overflow-hidden',
  item:      'flex items-center gap-3 px-3 py-2 hover:bg-app-bg cursor-pointer transition-colors',
  thumb:     'w-[36px] h-[48px] flex-shrink-0 rounded-[3px] object-cover bg-gradient-to-br from-slate-400 to-slate-700',
  thumbPh:   'w-[36px] h-[48px] flex-shrink-0 rounded-[3px] bg-gradient-to-br from-slate-400 to-slate-700',
  itemTitle: 'text-sm text-text-main truncate',
  itemMeta:  'text-xs text-text-muted',
  status:    'px-3 py-2 text-xs text-text-muted text-center',
  error:     'px-3 py-2 text-xs text-status-red text-center',
};

export default function SearchBar({ placeholder = 'Search for anything', value, onChange }: Props) {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const { query, setQuery, results, loading, error } = useSearch();

  // Sincronizar prop `value` controlada con el state interno del hook.
  const isControlled = value !== undefined;
  useEffect(() => {
    if (isControlled && value !== query) setQuery(value);
    // Solo cuando cambia `value` desde fuera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(next: string) {
    if (isControlled) onChange?.(next);
    setQuery(next);
    setOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate(`/animes?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleSelect(malId: number) {
    setOpen(false);
    navigate(`/animes/${malId}`);
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const showDropdown = open && query.trim().length >= 2;
  const topResults   = results.slice(0, MAX_DROPDOWN_RESULTS);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <form className={styles.form} onSubmit={handleSubmit} role="search">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search animes"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          className={styles.input}
        />
        <Search size={16} className={styles.icon} />
      </form>

      {showDropdown && (
        <div id="search-results" role="listbox" className={styles.dropdown}>
          {loading && <p className={styles.status}>Searching...</p>}
          {!loading && error && <p className={styles.error}>{error}</p>}
          {!loading && !error && topResults.length === 0 && (
            <p className={styles.status}>No results</p>
          )}
          {!loading && !error && topResults.map((anime) => (
            <button
              key={anime.malId}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => handleSelect(anime.malId)}
              className={styles.item + ' w-full text-left'}
            >
              {anime.imgMedium
                ? <img src={anime.imgMedium} alt="" className={styles.thumb} />
                : <div className={styles.thumbPh} />}
              <div className="min-w-0 flex-1">
                <p className={styles.itemTitle}>{anime.name}</p>
                {anime.malMean > 0 && (
                  <p className={styles.itemMeta}>★ {anime.malMean.toFixed(2)}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
