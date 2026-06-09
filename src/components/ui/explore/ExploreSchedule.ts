import type { Anime } from '@/types/anime';

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const JST_DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const DAY_BY_SHORT = new Map(WEEK_DAYS.map((day) => [day.slice(0, 3), day]));

export interface LocalBroadcastInfo {
  day: (typeof WEEK_DAYS)[number];
  time: string;
  timezone: string;
  sortMinutes: number;
}

export function getLocalBroadcastInfo(anime: Anime): LocalBroadcastInfo | null {
  const dayOfWeek = anime.broadcast?.dayOfWeek?.toLowerCase();
  const startTime = anime.broadcast?.startTime;
  if (!dayOfWeek || !startTime) return null;

  const dayIndex = JST_DAY_INDEX[dayOfWeek];
  const match = startTime.match(/^(\d{1,2}):(\d{2})/);
  if (dayIndex === undefined || !match) return null;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const jstReferenceSunday = 7;
  const date = new Date(
    Date.UTC(2024, 0, jstReferenceSunday + dayIndex, Number(match[1]) - 9, Number(match[2])),
  );

  const localDayShort = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: timezone,
  }).format(date);

  const day = DAY_BY_SHORT.get(localDayShort) ?? WEEK_DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
  const time = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
  const localParts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).formatToParts(date);
  const hour = Number(localParts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(localParts.find((part) => part.type === 'minute')?.value ?? 0);

  return { day, time, timezone, sortMinutes: hour * 60 + minute };
}

export function groupAnimesByLocalBroadcastDay(animes: Anime[]) {
  const grouped = new Map<(typeof WEEK_DAYS)[number], Array<{ anime: Anime; broadcast: LocalBroadcastInfo }>>(
    WEEK_DAYS.map((day) => [day, []]),
  );

  for (const anime of animes) {
    const broadcast = getLocalBroadcastInfo(anime);
    if (!broadcast) continue;
    grouped.get(broadcast.day)?.push({ anime, broadcast });
  }

  for (const items of grouped.values()) {
    items.sort((a, b) => a.broadcast.sortMinutes - b.broadcast.sortMinutes);
  }

  return grouped;
}
