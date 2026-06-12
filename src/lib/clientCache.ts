interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Cache TTL en memoria con dedup de requests in-flight, para GETs publicos
 * que devuelven lo mismo a todos los usuarios (genres, listas de animes,
 * widgets). NO usar con datos del usuario logueado ni contenido del feed.
 *
 * - Hit vigente: resuelve sin red.
 * - Miss con request en vuelo para la misma key: reutiliza esa promise
 *   (dos componentes montando a la vez = una sola request).
 * - Los fallos no se cachean: el siguiente intento vuelve a la red.
 */
export function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return Promise.resolve(entry.value as T);
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fetcher()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

export function invalidateCached(keyPrefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}

export const TTL = {
  TEN_MINUTES: 10 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const;
