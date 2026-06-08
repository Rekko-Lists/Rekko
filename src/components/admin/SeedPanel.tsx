import { useState } from 'react';
import api from '@/lib/api';
import { extractApiError } from '@/lib/apiErrors';

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
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-text-main font-gabarito mb-2">Seed de Animes</h2>
      <p className="text-text-muted mb-6">
        Importa animes desde MyAnimeList. Cada página trae ~500 animes. Máximo 40 páginas (~20.000 animes).
      </p>

      <div className="flex items-center gap-4 mb-4">
        <label className="text-text-main font-medium">Páginas:</label>
        <input
          type="number"
          min={1}
          max={40}
          value={pages}
          onChange={e => setPages(Math.min(40, Math.max(1, Number(e.target.value))))}
          className="input input-bordered w-24"
        />
        <button
          onClick={handleSeed}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading && <span className="loading loading-spinner loading-sm mr-1" />}
          {loading ? 'Ejecutando...' : 'Iniciar Seed'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}
      {result && (
        <div className="mt-4">
          <div className="alert alert-success mb-2">
            <span>Seed completado</span>
          </div>
          <pre className="bg-surface rounded-lg p-4 text-sm text-text-main overflow-auto max-h-64 border border-border">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
