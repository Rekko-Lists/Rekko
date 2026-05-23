/**
 * Formats integers in compact form (K, M).
 *   999 → "999"
 *   1_500 → "1.5K"
 *   12_000 → "12K"
 *   100_000 → "100K"
 *   1_500_000 → "1.5M"
 */
export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}K`;
  }
  const v = n / 1_000_000;
  return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`;
}
