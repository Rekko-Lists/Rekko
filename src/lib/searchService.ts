import api from '@/lib/api.ts';
import type { Anime } from '@/types/anime.ts';

/**
 * Resultado individual de la búsqueda. Por ahora asumimos que el backend
 * devuelve animes con la forma definida en `types/anime.ts`. Si en el
 * futuro el endpoint devuelve resultados heterogéneos (usuarios, posts...),
 * este tipo debería convertirse en una unión discriminada.
 */
export type SearchResult = Anime;

interface RawSearchEnvelope {
  data?: {
    results?: SearchResult[];
    animes?: SearchResult[];
  } | SearchResult[];
}

/**
 * GET /search?q=<query>
 *
 * Devuelve una lista de resultados. Es defensivo respecto al shape exacto
 * del envelope porque el endpoint todavía está en flux: acepta
 * `data.results`, `data.animes` o `data` directamente como array.
 */
export async function searchAnimes(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const response = await api.get<RawSearchEnvelope>('/search', {
    params: { q: trimmed },
    signal,
  });

  const payload = response.data?.data;
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results;
  if (payload?.animes)  return payload.animes;
  return [];
}
