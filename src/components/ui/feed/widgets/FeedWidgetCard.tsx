import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  onViewMore?: () => void;
  /** Mobile in-feed mode: no card background/border, content floats on the page bg. */
  flat?: boolean;
}

const styles = {
  card: "bg-surface border-[1.5px] border-border rounded-card p-4 font-gabarito",
  cardFlat: "px-1 py-2 font-gabarito",
  header: "mb-3 flex items-center justify-between gap-2",
  title: "text-sm font-normal text-text-main",
  titleFlat: "text-sm font-semibold text-text-main border-b-2 border-primary pb-0.5",
  viewMore: "text-[11px] font-medium text-primary hover:text-primary-dark hover:underline underline-offset-2",
};

export default function FeedWidgetCard({ title, children, onViewMore, flat = false }: Props) {
  return (
    <section className={flat ? styles.cardFlat : styles.card} aria-label={title}>
      <div className={styles.header}>
        <h2 className={flat ? styles.titleFlat : styles.title}>{title}</h2>
        {onViewMore && (
          <button type="button" className={styles.viewMore} onClick={onViewMore}>
            View more
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
