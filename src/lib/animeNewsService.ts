export interface AnimeNewsItem {
  id: string;
  title: string;
  date: string;
  cover?: string;
  url?: string;
}

interface JikanNewsEntry {
  mal_id?: number;
  title?: string;
  date?: string;
  url?: string;
  images?: {
    jpg?: {
      image_url?: string;
    };
  };
}

interface JikanNewsResponse {
  data?: JikanNewsEntry[];
}

function formatNewsDate(value?: string): string {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export async function getAnimeNews(
  malId: number,
  signal?: AbortSignal,
): Promise<AnimeNewsItem[]> {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/news`, {
    signal,
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as JikanNewsResponse;
  return (payload.data ?? []).flatMap((item) => {
    if (!item.mal_id || !item.title) return [];

    return {
      id: `${malId}-${item.mal_id}`,
      title: item.title,
      date: formatNewsDate(item.date),
      cover: item.images?.jpg?.image_url,
      url: item.url,
    };
  });
}

export async function getLatestAnimeNews(
  malIds: number[],
  limit = 3,
  signal?: AbortSignal,
): Promise<AnimeNewsItem[]> {
  const uniqueIds = [...new Set(malIds)].filter(Number.isFinite).slice(0, 4);
  const news: AnimeNewsItem[] = [];

  for (const malId of uniqueIds) {
    if (signal?.aborted) break;
    const items = await getAnimeNews(malId, signal);
    news.push(...items);
    if (news.length >= limit) break;
  }

  return news.slice(0, limit);
}
