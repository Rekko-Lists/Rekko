import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAnimes } from '@/lib/searchService';
import type { Anime } from '@/lib/searchService';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 3;

interface Props {
  onGuess: (animeName: string) => void;
  disabled?: boolean;
}

const styles = {
  container: 'relative w-full',
  inputRow: 'flex items-center w-full',
  input: 'flex-1 h-[47px] border border-border rounded-l-btn px-4 bg-surface text-sm text-text-main placeholder:text-text-muted shadow-input focus:outline-none focus:border-primary transition-colors disabled:bg-app-bg disabled:cursor-not-allowed',
  submitBtn: 'h-[47px] px-5 bg-gradient-cta text-white text-sm font-semibold rounded-r-btn hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed',
  spinner: 'w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block',
  dropdown: 'absolute top-full left-0 right-0 z-50 mt-1 bg-surface border border-border rounded-btn shadow-card max-h-52 overflow-y-auto',
  dropdownLoading: 'px-4 py-2.5 text-sm text-text-muted',
  dropdownItem: 'w-full flex items-center gap-3 px-4 py-2.5 hover:bg-app-bg transition-colors text-left cursor-pointer',
  dropdownCover: 'w-8 h-10 object-cover rounded-card flex-shrink-0',
  dropdownName: 'text-sm text-text-main line-clamp-2',
};

export default function AnimeGuessInput({ onGuess, disabled = false }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cancel pending requests on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = useCallback(async (query: string) => {
    if (query.trim().length < MIN_CHARS) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const animes = await searchAnimes(query.trim(), abortRef.current.signal);
      setResults(animes);
      setShowDropdown(animes.length > 0);
    } catch (err: unknown) {
      const isAbort =
        (err as { name?: string })?.name === 'AbortError' ||
        (err as { code?: string })?.code === 'ERR_CANCELED' ||
        (err as { name?: string })?.name === 'CanceledError';
      if (!isAbort) {
        setResults([]);
        setShowDropdown(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(value);
    }, DEBOUNCE_MS);
  }

  function selectAnime(name: string) {
    setInputValue('');
    setResults([]);
    setShowDropdown(false);
    onGuess(name);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) return;
      // If there's an exact match in results, use that; otherwise submit raw
      const match = results.find((r) => r.name.toLowerCase() === trimmed.toLowerCase());
      selectAnime(match ? match.name : trimmed);
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Anime name... (min. 3 characters)"
          disabled={disabled}
          className={styles.input}
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = inputValue.trim();
            if (!trimmed || disabled) return;
            const match = results.find((r) => r.name.toLowerCase() === trimmed.toLowerCase());
            selectAnime(match ? match.name : trimmed);
          }}
          disabled={disabled || !inputValue.trim()}
          className={styles.submitBtn}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            'Guess'
          )}
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && !disabled && (
        <div className={styles.dropdown}>
          {loading && (
            <div className={styles.dropdownLoading}>Searching...</div>
          )}
          {!loading && results.map((anime) => (
            <button
              key={anime.malId}
              type="button"
              className={styles.dropdownItem}
              onMouseDown={(e) => { e.preventDefault(); selectAnime(anime.name); }}
            >
              {anime.imgMedium && (
                <img
                  src={anime.imgMedium}
                  alt={anime.name}
                  className={styles.dropdownCover}
                />
              )}
              <span className={styles.dropdownName}>{anime.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
