import { useState, FormEvent } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const styles = {
  wrap:    'flex items-center justify-center gap-1 py-6 font-gabarito text-sm',
  btn:     'w-7 h-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-border transition-colors text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed',
  active:  'w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white font-semibold',
  ellipsis:'w-7 h-7 flex items-center justify-center text-text-muted select-none',
  goWrap:  'flex items-center gap-1.5 ml-3 pl-3 border-l border-border',
  goLabel: 'text-text-muted text-xs',
  goInput: 'w-12 h-7 border border-border rounded-[5px] px-2 text-center text-sm bg-surface focus:outline-none focus:border-primary',
  goBtn:   'h-7 px-3 bg-primary text-white rounded-[5px] text-xs font-semibold cursor-pointer hover:bg-primary-dark transition-colors',
};

function getPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = getPages(currentPage, totalPages);
  const [inputVal, setInputVal] = useState('');

  function handleGoSubmit(e: FormEvent) {
    e.preventDefault();
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      onPageChange(n);
    }
    setInputVal('');
  }

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {'<'}
      </button>

      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className={styles.ellipsis}>...</span>
          : <button
              key={p}
              className={p === currentPage ? styles.active : styles.btn}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </button>
      )}

      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {'>'}
      </button>

      <form className={styles.goWrap} onSubmit={handleGoSubmit}>
        <span className={styles.goLabel}>Go to</span>
        <input
          className={styles.goInput}
          type="number"
          min={1}
          max={totalPages}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder={String(currentPage)}
        />
        <button type="submit" className={styles.goBtn}>Go</button>
      </form>
    </div>
  );
}
