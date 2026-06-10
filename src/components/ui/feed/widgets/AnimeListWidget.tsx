import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Anime } from "@/types/anime";
import FeedWidgetCard from "./FeedWidgetCard";

interface Props {
  title: string;
  load: (signal?: AbortSignal) => Promise<Anime[]>;
  onViewMore?: () => void;
  showBroadcastTime?: boolean;
  /** Mobile in-feed mode: render without card background/border. */
  flat?: boolean;
}

const styles = {
  list: "flex flex-col gap-2",
  row: "flex items-center gap-2 text-left hover:text-primary transition-colors",
  cover: "h-[50px] w-[35px] flex-shrink-0 rounded-[3px] object-cover bg-gradient-to-br from-slate-400 to-slate-700",
  rank: "w-4 text-xs font-semibold text-primary",
  body: "min-w-0 flex-1",
  title: "text-xs text-text-main leading-snug line-clamp-2",
  meta: "mt-0.5 text-[10px] text-text-muted",
  empty: "text-xs text-text-muted",
};

function formatJstTimeToLocal(value?: string): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return `${value} JST`;

  const now = new Date();
  const jstDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      Number(match[1]) - 9,
      Number(match[2]),
    ),
  );
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || "UTC",
  }).format(jstDate);

  return `${time} ${timezone}`;
}

export default function AnimeListWidget({ title, load, onViewMore, showBroadcastTime = false, flat = false }: Props) {
  const navigate = useNavigate();
  const [animes, setAnimes] = useState<Anime[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setAnimes(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAnimes([]);
      });

    return () => controller.abort();
  }, [load]);

  return (
    <FeedWidgetCard title={title} onViewMore={onViewMore} flat={flat}>
      {animes.length === 0 ? (
        <p className={styles.empty}>No animes found.</p>
      ) : (
        <div className={styles.list}>
          {animes.map((anime, index) => (
            <button
              key={anime.malId}
              type="button"
              className={styles.row}
              onClick={() => navigate(`/animes/${anime.malId}`)}
            >
              <span className={styles.rank}>{index + 1}</span>
              {anime.imgMedium ? (
                <img src={anime.imgMedium} alt="" className={styles.cover} />
              ) : (
                <div className={styles.cover} />
              )}
              <span className={styles.body}>
                <span className={styles.title}>{anime.name}</span>
                <span className={styles.meta}>
                  {showBroadcastTime
                    ? formatJstTimeToLocal(anime.broadcast?.startTime) ?? "Time TBA"
                    : `Score ${anime.malMean || anime.mean || "TBA"}`}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </FeedWidgetCard>
  );
}
