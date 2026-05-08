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
    </div>
  );
}
