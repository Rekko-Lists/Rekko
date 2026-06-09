import type { ReactNode } from "react";
import type { Anime } from "@/types/anime";
import ExploreAnimeTile from "./ExploreAnimeTile";

interface Props {
  title: string;
  subtitle?: string;
  animes: Anime[];
  action?: ReactNode;
  columns?: "hero" | "compact";
}

const styles = {
  section: "rounded-card border border-border bg-surface/90 p-5 shadow-sm",
  header: "mb-4 flex items-end justify-between gap-3",
  title: "text-[24px] font-bold leading-none text-text-main",
  subtitle: "mt-1 text-xs text-text-muted",
  gridHero: "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5",
  gridCompact: "grid grid-cols-2 gap-4 md:grid-cols-4",
};

export default function ExploreAnimeSection({ title, subtitle, animes, action, columns = "hero" }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={columns === "hero" ? styles.gridHero : styles.gridCompact}>
        {animes.map((anime, index) => (
          <ExploreAnimeTile key={anime.malId} anime={anime} rank={index + 1} large={columns === "hero"} />
        ))}
      </div>
    </section>
  );
}
