export interface SeasonOption {
  value: string;   // e.g. 'spring_2026' | 'later'
  label: string;   // e.g. 'Spring 2026' | 'Later'
  gte: string;     // ISO date — inicio de la temporada
  lt?: string;     // ISO date — fin de la temporada (ausente en 'later')
}

const SEASON_ORDER = ['winter', 'spring', 'summer', 'fall'] as const;
type SeasonName = (typeof SEASON_ORDER)[number];

// Primer mes de cada temporada (1-indexed)
const SEASON_MONTH_START: Record<SeasonName, number> = {
  winter: 1,
  spring: 4,
  summer: 7,
  fall:   10,
};

function getSeasonForMonth(month: number): SeasonName {
  if (month <= 3)  return 'winter';
  if (month <= 6)  return 'spring';
  if (month <= 9)  return 'summer';
  return 'fall';
}

function advanceSeason(season: SeasonName, year: number): { season: SeasonName; year: number } {
  const idx = SEASON_ORDER.indexOf(season);
  const nextIdx = (idx + 1) % 4;
  return {
    season: SEASON_ORDER[nextIdx],
    year: nextIdx === 0 ? year + 1 : year,
  };
}

function seasonStartISO(season: SeasonName, year: number): string {
  return new Date(year, SEASON_MONTH_START[season] - 1, 1).toISOString();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Devuelve las opciones de temporada disponibles en el filtro:
 *   temporada actual, las 2 siguientes, y "Later".
 * La regla de negocio es: máximo 2 temporadas por delante + Later.
 */
export function computeSeasonOptions(): SeasonOption[] {
  const now = new Date();
  const current = {
    season: getSeasonForMonth(now.getMonth() + 1),
    year: now.getFullYear(),
  };

  const s0 = current;
  const s1 = advanceSeason(s0.season, s0.year);
  const s2 = advanceSeason(s1.season, s1.year);
  const laterStart = advanceSeason(s2.season, s2.year);

  const toOption = (
    s: { season: SeasonName; year: number },
    next: { season: SeasonName; year: number }
  ): SeasonOption => ({
    value: `${s.season}_${s.year}`,
    label: `${capitalize(s.season)} ${s.year}`,
    gte: seasonStartISO(s.season, s.year),
    lt:  seasonStartISO(next.season, next.year),
  });

  return [
    toOption(s0, s1),
    toOption(s1, s2),
    toOption(s2, laterStart),
    {
      value: 'later',
      label: 'Later',
      gte: seasonStartISO(laterStart.season, laterStart.year),
    },
  ];
}
