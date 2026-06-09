import { useState } from 'react';
import api from '@/lib/api';
import { extractApiError } from '@/lib/apiErrors';
import Spinner from '@/components/ui/common/Spinner';

const styles = {
  root: 'p-6 max-w-2xl',
  heading: 'text-2xl font-bold text-text-main font-gabarito mb-2',
  description: 'text-text-muted mb-6',
  row: 'flex items-center gap-4 mb-4',
  label: 'text-text-main font-medium',
  input:
    'border border-border rounded-btn px-3 h-[42px] bg-surface text-text-main text-sm focus:outline-none focus:border-primary transition-colors w-24',
  btnPrimary:
    'inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-btn text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60',
  alertError:
    'mt-4 rounded-card border border-status-red/30 bg-status-red/5 px-4 py-3 text-sm text-status-red',
  alertSuccess:
    'rounded-card border border-status-green/30 bg-status-green/5 px-4 py-3 text-sm text-status-green mb-2',
  resultWrapper: 'mt-4',
  pre: 'bg-surface rounded-btn p-4 text-sm text-text-main overflow-auto max-h-64 border border-border',
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
      <h2 className={styles.heading}>Seed de Animes</h2>
      <p className={styles.description}>
        Importa animes desde MyAnimeList. Cada página trae ~500 animes. Máximo 40 páginas (~20.000 animes).
      </p>

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
        <button
          onClick={handleSeed}
          disabled={loading}
          className={styles.btnPrimary}
        >
          {loading && <Spinner size="sm" variant="white" className="mr-1" />}
          {loading ? 'Ejecutando...' : 'Iniciar Seed'}
        </button>
      </div>

      {error && (
        <div className={styles.alertError}>
          <span>{error}</span>
        </div>
      )}
      {result && (
        <div className={styles.resultWrapper}>
          <div className={styles.alertSuccess}>
            <span>Seed completado</span>
          </div>
          <pre className={styles.pre}>{result}</pre>
        </div>
      )}
    </div>
  );
}
