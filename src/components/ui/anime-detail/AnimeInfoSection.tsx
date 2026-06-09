import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Anime } from '@/types/anime';

interface Props {
  anime: Anime;
}

const styles = {
  card:    'w-[202px] bg-[rgba(246,246,246,0.6)] border border-border rounded-card p-3 font-gabarito text-[13px] text-text-main leading-tight',
  icon:    'text-text-muted mb-2',
  row:     'mb-1.5 last:mb-0',
  label:   'text-text-main font-medium',
  value:   'text-text-main',
  amber:   'text-primary-dark',
  amberUL: 'text-primary underline underline-offset-2 hover:opacity-80 cursor-pointer bg-transparent border-0 p-0 font-inherit',
  genres:  'mt-3 flex flex-wrap gap-x-1.5 gap-y-1',
  genreLink: 'text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 font-inherit',
  genresLabel: 'mt-3 text-text-main font-medium',
};

const STATUS_LABEL: Record<string, string> = {
  finished_airing:   'Aired',
  currently_airing:  'Airing',
  not_yet_aired:     'Upcoming',
};

function formatSeason(season?: string, year?: number): string | null {
  if (!season && !year) return null;
  const s = season ? season.charAt(0).toUpperCase() + season.slice(1) : '';
  if (s && year) return `${s} ${year}`;
  if (s) return s;
  return year ? String(year) : null;
}

function formatDuration(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  return `${minutes} min. per ep.`;
}

export default function AnimeInfoSection({ anime }: Props) {
  const navigate = useNavigate();

  const status = STATUS_LABEL[anime.status] ?? '—';
  const broadcastDay = anime.broadcast?.dayOfWeek
    ? anime.broadcast.dayOfWeek.charAt(0).toUpperCase() + anime.broadcast.dayOfWeek.slice(1) + 's'
    : null;
  const broadcastTime = anime.broadcast?.startTime ?? null;
  const premiered = formatSeason(anime.premieredSeason, anime.premieredYear);
  const duration = formatDuration(anime.duration);

  const handleGenreClick = (genre: string) => {
    navigate(`/animes?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <aside className={styles.card} aria-label="Anime information">
      <Info size={14} className={styles.icon} />

      <div className={styles.row}>
        <span className={styles.label}>Status:</span>{' '}
        <span className={styles.value}>{status}</span>
      </div>

      {(broadcastDay || broadcastTime) && (
        <div className={styles.row}>
          <span className={styles.label}>Broadcast:</span>{' '}
          {broadcastDay && <span className={styles.amber}>{broadcastDay}</span>}
          {broadcastDay && broadcastTime && <span> at </span>}
          {broadcastTime && <span className={styles.amber}>{broadcastTime}</span>}
          {broadcastTime && <span> (JST)</span>}
        </div>
      )}

      {(() => {
        const mediaType = (anime as Anime & { mediaType?: string }).mediaType;
        if (!mediaType) return null;
        return (
          <div className={styles.row}>
            <span className={styles.label}>Type:</span>{' '}
            <span className={styles.value}>{mediaType.toUpperCase()}</span>
          </div>
        );
      })()}

      {premiered && (
        <div className={styles.row}>
          <span className={styles.label}>Premiered:</span>{' '}
          <span className={styles.amberUL}>{premiered}</span>
        </div>
      )}

      {duration && (
        <div className={styles.row}>
          <span className={styles.label}>Duration:</span>{' '}
          <span className={styles.value}>{duration}</span>
        </div>
      )}

      {anime.studios && anime.studios.length > 0 && (
        <div className={styles.row}>
          <span className={styles.label}>Studios:</span>{' '}
          {anime.studios.map((s, i) => (
            <span key={s}>
              <span className={styles.amberUL}>{s}</span>
              {i < anime.studios.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      {anime.demographic && (
        <div className={styles.row}>
          <span className={styles.label}>Demographic:</span>{' '}
          <span className={styles.value}>{anime.demographic}</span>
        </div>
      )}

      {anime.rating && (
        <div className={styles.row}>
          <span className={styles.label}>Rating:</span>{' '}
          <span className={styles.value}>{anime.rating.toUpperCase().replace(/_/g, '-')}</span>
        </div>
      )}

      {anime.genres && anime.genres.length > 0 && (
        <>
          <div className={styles.genresLabel}>Genres:</div>
          <div className={styles.genres}>
            {anime.genres.map((g, i) => (
              <span key={g}>
                <button
                  type="button"
                  className={styles.genreLink}
                  onClick={() => handleGenreClick(g)}
                >
                  {g}
                </button>
                {i < anime.genres.length - 1 && <span className="text-text-main">,</span>}
              </span>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
