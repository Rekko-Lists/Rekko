import { useState } from 'react';
import api from '@/lib/api';
import { extractApiError } from '@/lib/apiErrors';
import Spinner from '@/components/ui/common/Spinner';

const styles = {
  root:         'px-4 py-6 max-w-2xl md:px-8 md:py-8',
  titleRow:     'flex items-baseline gap-3 mb-1',
  title:        'text-[32px] font-semibold text-text-main leading-none',
  titleDash:    'text-[24px] font-semibold text-text-secondary leading-none',
  description:  'text-sm text-text-muted mt-2 mb-6',
  card:         'bg-surface border border-border rounded-card shadow-card p-6',
  cardTitle:    'text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4',
  row:          'flex items-center gap-4 flex-wrap',
  label:        'text-sm font-medium text-text-main',
  input:        'border border-border rounded-btn px-3 h-[42px] bg-app-bg text-text-main text-sm focus:outline-none focus:border-primary transition-colors w-24 shadow-input',
  btnCta:       'inline-flex items-center gap-2 bg-gradient-to-b from-grad-start to-grad-end text-white px-5 h-[42px] rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60',
  divider:      'my-5 border-t border-border-light',
  alertError:   'rounded-card border border-status-red/30 bg-status-red/5 px-4 py-3 text-sm text-status-red mt-5',
  alertSuccess: 'rounded-card border border-status-green/30 bg-status-green/5 px-4 py-3 text-sm text-status-green',
  resultTitle:  'text-xs font-semibold text-text-secondary uppercase tracking-wider mt-4 mb-2',
  pre:          'bg-app-bg rounded-card p-4 text-xs text-text-main overflow-auto max-h-64 border border-border font-mono',
};

export default function SeedPanel() {
  const [pages, setPages] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.get(`/anime/seed?pages=${pages}`);
      setResult(JSON.stringify(res.data.data, null, 2));
    } catch (e: unknown) {
      setError(extractApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Seed</h2>
        <span className={styles.titleDash}>— Animes</span>
      </div>
      <p className={styles.description}>
        Importa animes desde MyAnimeList. Cada página trae ~500 animes. Máximo 40 páginas (~20.000 animes).
      </p>

      <div className={styles.card}>
        <p className={styles.cardTitle}>Configuración</p>
        <div className={styles.row}>
          <label className={styles.label}>Páginas:</label>
          <input
            type="number"
            min={1}
            max={40}
            value={pages}
            onChange={e => setPages(Math.min(40, Math.max(1, Number(e.target.value))))}
            className={styles.input}
          />
          <button onClick={handleSeed} disabled={loading} className={styles.btnCta}>
            {loading && <Spinner size="sm" variant="white" />}
            {loading ? 'Ejecutando...' : 'Iniciar Seed'}
          </button>
        </div>

        {result && (
          <>
            <div className={styles.divider} />
            <div className={styles.alertSuccess}>Seed completado correctamente</div>
            <p className={styles.resultTitle}>Resultado</p>
            <pre className={styles.pre}>{result}</pre>
          </>
        )}
      </div>

      {error && <div className={styles.alertError}>{error}</div>}
    </div>
  );
}
