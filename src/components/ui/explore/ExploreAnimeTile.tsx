import { Link } from "react-router-dom";
import type { Anime } from "@/types/anime";

interface Props {
  anime: Anime;
  rank?: number;
  large?: boolean;
}

const styles = {
  card: "group relative overflow-hidden rounded-card border border-border bg-surface shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-card",
  cover: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
  fallback: "flex h-full w-full items-end bg-gradient-to-br from-slate-300 via-slate-500 to-slate-800 p-3 text-white",
  overlay: "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/88 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
  rank: "absolute left-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white shadow",
  title: "text-sm font-bold leading-tight text-white drop-shadow",
  meta: "mt-1 text-[11px] text-white/80",
  synopsis: "mt-2 line-clamp-4 text-[11px] leading-snug text-white/75",
};

export default function ExploreAnimeTile({ anime, rank, large = false }: Props) {
  const score = anime.malMean ?? anime.mean ?? "TBA";
  const status = typeof anime.status === "string" ? anime.status.replace(/_/g, " ") : "TBA";

  return (
    <Link to={`/animes/${anime.malId}`} className={`${styles.card} ${large ? "aspect-[2/3]" : "aspect-[3/4]"}`}>
      {rank && <span className={styles.rank}>#{rank}</span>}
      {anime.imgLarge || anime.imgMedium ? (
        <img src={anime.imgLarge || anime.imgMedium} alt={anime.name} className={styles.cover} />
      ) : (
        <div className={styles.fallback}>{anime.name}</div>
      )}
      <div className={styles.overlay}>
        <h3 className={styles.title}>{anime.name}</h3>
        <p className={styles.meta}>Score {score} · {status}</p>
        <p className={styles.synopsis}>{anime.synopsis}</p>
      </div>
    </Link>
  );
}
