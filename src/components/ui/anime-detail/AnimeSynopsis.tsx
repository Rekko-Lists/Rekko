interface Props {
  title: string;
  synopsis?: string;
  showTitle?: boolean;
  showDivider?: boolean;
}

const styles = {
  wrap: "flex flex-col font-gabarito",
  title: "text-[20px] text-text-main text-center leading-none",
  divider: "h-px bg-border my-3",
  label: "text-[20px] text-text-main mb-2 leading-none",
  body: "text-[11px] text-text-main whitespace-pre-wrap max-h-[208px] overflow-y-auto leading-snug pr-2",
  empty: "text-[11px] text-text-muted italic",
};

export default function AnimeSynopsis({
  title,
  synopsis,
  showTitle = true,
  showDivider = true,
}: Props) {
  return (
    <section className={styles.wrap} aria-label="Synopsis">
      {showTitle && <h1 className={styles.title}>{title}</h1>}
      {showDivider && <div className={styles.divider} />}
      <p className={styles.label}>Synopsis:</p>
      {synopsis && synopsis.trim().length > 0 ? (
        <div className={styles.body}>{synopsis}</div>
      ) : (
        <p className={styles.empty}>No synopsis available.</p>
      )}
    </section>
  );
}
