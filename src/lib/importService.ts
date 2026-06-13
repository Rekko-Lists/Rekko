import api from '@/lib/api';

export type ImportPlatform = 'mal' | 'anilist';

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: { malId: number; reason: string }[];
}

/** Imports a MyAnimeList list from its exported XML file. */
export async function importMalXml(file: File): Promise<ImportResult> {
  const fd = new FormData();
  fd.append('list', file);
  const res = await api.post<{ success: boolean; data: ImportResult }>(
    '/anime/import/mal/xml',
    fd,
  );
  return res.data.data;
}

/** Imports an AniList list given only a public username (no auth needed). */
export async function importAnilist(username: string): Promise<ImportResult> {
  const res = await api.post<{ success: boolean; data: ImportResult }>(
    '/anime/import/anilist',
    { username },
  );
  return res.data.data;
}
